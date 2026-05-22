import { useTexture } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import { folder, useControls } from "leva";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import {
  attribute,
  float,
  mix,
  sin,
  texture,
  uniform,
  uv,
  vec2,
} from "three/tsl";
import * as THREE from "three/webgpu";

const ATLAS_URL = "/assets/materials/splatter/splatter_atlas.png";
const ATLAS_JSON_URL = "/assets/materials/splatter/splatter_atlas.json";

useTexture.preload(ATLAS_URL);

/** Per-tile metadata produced by `apps/astro/scripts/splatter/build_splatter_atlas.py`. */
type AtlasTile = {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  u0: number;
  v0: number;
  u1: number;
  v1: number;
  aspect: number;
};

type AtlasManifest = {
  atlasWidth: number;
  atlasHeight: number;
  flipY: boolean;
  tiles: AtlasTile[];
};

/**
 * Deterministic PRNG so leva tweaks reshuffle stars predictably with `seed`.
 * Mulberry32 — small, fast, decent distribution for cosmetic randomness.
 */
function mulberry32(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TMP_MAT = new THREE.Matrix4();
const TMP_QUAT = new THREE.Quaternion();
const TMP_TWIST = new THREE.Quaternion();
const TMP_POS = new THREE.Vector3();
const TMP_INWARD = new THREE.Vector3();
const TMP_SCALE = new THREE.Vector3();
const TMP_MAT_READ = new THREE.Matrix4();
const PLANE_NORMAL = new THREE.Vector3(0, 0, 1);
const Z_AXIS = new THREE.Vector3(0, 0, 1);

const PALETTE_DEFAULTS = ["#ffffff", "#84adff", "#f58d7b"] as const;

type StarsData = {
  count: number;
  matrices: Float32Array;
  uvRects: Float32Array; // 4 floats per instance: u0, v0, u1, v1
  tints: Float32Array; // 3 floats per instance: r, g, b (linear, premultiplied by intensity)
  twinkles: Float32Array; // 2 floats per instance: phase (radians), speedFactor
};

/** Context exposed to render-prop children so they can attach themselves to
 *  the spinning star shell (e.g. a directional light placed on the radius). */
export type StarsChildContext = {
  radius: number;
};

type StarsChildren =
  | ReactNode
  | ((ctx: StarsChildContext) => ReactNode);

type StarsProps = {
  children?: StarsChildren;
};

export function Stars({ children }: StarsProps = {}) {
  const controls = useControls("Stars", {
    Distribution: folder({
      count: { value: 30000, min: 100, max: 100_000, step: 100 },
      radius: { value: 5000, min: 100, max: 20000, step: 50 },
      shellThickness: { value: 0.0, min: 0, max: 1, step: 0.01 },
      seed: { value: 1, min: 0, max: 1000, step: 1 },
    }),
    Size: folder({
      sizeMin: { value: 20, min: 1, max: 500, step: 1 },
      sizeMax: { value: 40, min: 1, max: 1500, step: 1 },
      sizeBias: { value: 2.5, min: 0.2, max: 8, step: 0.1 },
    }),
    Color: folder({
      color1: PALETTE_DEFAULTS[0],
      color2: PALETTE_DEFAULTS[1],
      color3: PALETTE_DEFAULTS[2],
      colorJitter: { value: 0.06, min: 0, max: 1, step: 0.01 },
      intensity: { value: 2.8, min: 0, max: 5, step: 0.05 },
    }),
    Material: folder({
      additive: true,
    }),
    Twinkle: folder({
      twinkle: true,
      twinkleSpeed: { value: 2.0, min: 0, max: 20, step: 0.1 },
      twinkleAmount: { value: 0.6, min: 0, max: 1, step: 0.01 },
      twinkleSpeedJitter: { value: 0.7, min: 0, max: 1, step: 0.01 },
      twinkleSharpness: { value: 1.0, min: 0.2, max: 8, step: 0.1 },
    }),
  });

  const atlasTexture = useTexture(ATLAS_URL);
  // useLoader+FileLoader returns the raw response as a string for text URLs.
  const atlasJsonRaw = useLoader(THREE.FileLoader, ATLAS_JSON_URL) as string;
  const manifest = useMemo<AtlasManifest>(
    () => JSON.parse(atlasJsonRaw),
    [atlasJsonRaw],
  );

  useMemo(() => {
    // No mipmaps: a single shared atlas can bleed between adjacent tiles at
    // coarser mip levels. The drops are tiny anyway, so a sharp linear sample
    // looks fine and avoids halos.
    atlasTexture.colorSpace = THREE.SRGBColorSpace;
    atlasTexture.flipY = manifest.flipY;
    atlasTexture.wrapS = THREE.ClampToEdgeWrapping;
    atlasTexture.wrapT = THREE.ClampToEdgeWrapping;
    atlasTexture.minFilter = THREE.LinearFilter;
    atlasTexture.magFilter = THREE.LinearFilter;
    atlasTexture.generateMipmaps = false;
    atlasTexture.anisotropy = 1;
    atlasTexture.needsUpdate = true;
  }, [atlasTexture, manifest.flipY]);

  const data: StarsData = useMemo(() => {
    const {
      count,
      radius,
      shellThickness,
      seed,
      sizeMin,
      sizeMax,
      sizeBias,
      color1,
      color2,
      color3,
      colorJitter,
      intensity,
      twinkleSpeedJitter,
    } = controls;

    const tiles = manifest.tiles;
    const palette = [color1, color2, color3].map((c) =>
      new THREE.Color(c).convertSRGBToLinear(),
    );
    const rand = mulberry32(seed * 9973 + 17);

    const matrices = new Float32Array(count * 16);
    const uvRects = new Float32Array(count * 4);
    const tints = new Float32Array(count * 3);
    const twinkles = new Float32Array(count * 2);

    for (let i = 0; i < count; i++) {
      const tile = tiles[Math.floor(rand() * tiles.length)]!;

      // Uniform random point on a sphere shell (no pole clustering).
      const u = rand();
      const v = rand();
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);
      const r = radius * (1 - shellThickness * rand());
      const sinPhi = Math.sin(phi);
      TMP_POS.set(
        r * sinPhi * Math.cos(theta),
        r * sinPhi * Math.sin(theta),
        r * Math.cos(phi),
      );

      // Face the origin: rotate +Z (plane normal) to point back toward (0,0,0).
      TMP_INWARD.copy(TMP_POS).normalize().multiplyScalar(-1);
      TMP_QUAT.setFromUnitVectors(PLANE_NORMAL, TMP_INWARD);

      // Random twist around the plane's local +Z, then face-origin rotation.
      const twistAngle = rand() * Math.PI * 2;
      TMP_TWIST.setFromAxisAngle(Z_AXIS, twistAngle);
      TMP_QUAT.multiply(TMP_TWIST);

      // Bias toward small sizes via Math.pow on a uniform sample.
      const sizeT = Math.pow(rand(), sizeBias);
      const sizeBase = sizeMin + (sizeMax - sizeMin) * sizeT;
      // Random horizontal flip for extra variety (mirrors the splatter).
      const flip = rand() < 0.5 ? -1 : 1;
      TMP_SCALE.set(flip * sizeBase * tile.aspect, sizeBase, 1);

      TMP_MAT.compose(TMP_POS, TMP_QUAT, TMP_SCALE);
      TMP_MAT.toArray(matrices, i * 16);

      uvRects[i * 4 + 0] = tile.u0;
      uvRects[i * 4 + 1] = tile.v0;
      uvRects[i * 4 + 2] = tile.u1;
      uvRects[i * 4 + 3] = tile.v1;

      const picked = palette[Math.floor(rand() * palette.length)]!;
      const jr = (rand() - 0.5) * 2 * colorJitter;
      const jg = (rand() - 0.5) * 2 * colorJitter;
      const jb = (rand() - 0.5) * 2 * colorJitter;
      tints[i * 3 + 0] = Math.max(0, picked.r + jr) * intensity;
      tints[i * 3 + 1] = Math.max(0, picked.g + jg) * intensity;
      tints[i * 3 + 2] = Math.max(0, picked.b + jb) * intensity;

      // Per-instance twinkle: random phase plus a multiplicative speed factor
      // in [1 - jitter, 1 + jitter] so neighbouring stars drift out of sync.
      twinkles[i * 2 + 0] = rand() * Math.PI * 2;
      twinkles[i * 2 + 1] = 1 + (rand() - 0.5) * 2 * twinkleSpeedJitter;
    }

    return { count, matrices, uvRects, tints, twinkles };
  }, [manifest, controls]);

  const blending = controls.additive
    ? THREE.AdditiveBlending
    : THREE.NormalBlending;

  const resolvedChildren =
    typeof children === "function"
      ? children({ radius: controls.radius })
      : children;

  return (
    <StarsInstancedMesh
      atlasTexture={atlasTexture}
      data={data}
      blending={blending}
      twinkleEnabled={controls.twinkle}
      twinkleSpeed={controls.twinkleSpeed}
      twinkleAmount={controls.twinkleAmount}
      twinkleSharpness={controls.twinkleSharpness}
    >
      {resolvedChildren}
    </StarsInstancedMesh>
  );
}

type StarsInstancedMeshProps = {
  atlasTexture: THREE.Texture;
  data: StarsData;
  blending: THREE.Blending;
  twinkleEnabled: boolean;
  twinkleSpeed: number;
  twinkleAmount: number;
  twinkleSharpness: number;
  children?: ReactNode;
};

function StarsInstancedMesh({
  atlasTexture,
  data,
  blending,
  twinkleEnabled,
  twinkleSpeed,
  twinkleAmount,
  twinkleSharpness,
  children,
}: StarsInstancedMeshProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Stable uniform nodes — mutating `.value` propagates to the GPU without
  // forcing a TSL shader rebuild on every slider change.
  const uTime = useMemo(() => uniform(0), []);
  const uTwinkleSpeed = useMemo(() => uniform(0), []);
  const uTwinkleAmount = useMemo(() => uniform(0), []);
  const uTwinkleSharpness = useMemo(() => uniform(1), []);

  useEffect(() => {
    uTwinkleSpeed.value = twinkleSpeed;
    uTwinkleAmount.value = twinkleEnabled ? twinkleAmount : 0;
    uTwinkleSharpness.value = Math.max(0.001, twinkleSharpness);
  }, [
    twinkleEnabled,
    twinkleSpeed,
    twinkleAmount,
    twinkleSharpness,
    uTwinkleSpeed,
    uTwinkleAmount,
    uTwinkleSharpness,
  ]);

  useFrame((state) => {
    uTime.value = state.clock.elapsedTime;
  });

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const material = mesh.material as THREE.MeshBasicNodeMaterial;

    // TSL shader: read per-instance uv rect, map plane-local uv into it,
    // sample atlas, multiply rgb by per-instance tint, use alpha for opacity.
    // Idempotent — safe to re-run on data changes (e.g. count edits).
    const uvRect = attribute<"vec4">("aTileUvRect", "vec4");
    const tint = attribute<"vec3">("aTint", "vec3");
    const twinkleAttr = attribute<"vec2">("aTwinkle", "vec2");
    const localUv = uv();
    const atlasUv = vec2(
      mix(uvRect.x, uvRect.z, localUv.x),
      mix(uvRect.y, uvRect.w, localUv.y),
    );
    const sample = texture(atlasTexture, atlasUv);

    // Per-instance twinkle: sin(time * speed * speedFactor + phase) mapped to
    // [0,1], optionally sharpened, then lerped into [1 - amount, 1] so the
    // star can only dim (never overbrighten beyond its base tint).
    const phase = twinkleAttr.x;
    const speedFactor = twinkleAttr.y;
    const wave = sin(uTime.mul(uTwinkleSpeed).mul(speedFactor).add(phase));
    const wave01 = wave.mul(0.5).add(0.5).pow(uTwinkleSharpness);
    const twinkleFactor = mix(float(1).sub(uTwinkleAmount), float(1), wave01);

    material.colorNode = sample.rgb.mul(tint).mul(twinkleFactor);
    material.opacityNode = sample.a;
    material.transparent = true;
    material.depthWrite = false;
    material.toneMapped = false;
    material.side = THREE.DoubleSide;
    material.blending = blending;
    material.needsUpdate = true;

    for (let i = 0; i < data.count; i++) {
      TMP_MAT_READ.fromArray(data.matrices, i * 16);
      mesh.setMatrixAt(i, TMP_MAT_READ);
    }
    mesh.count = data.count;
    mesh.instanceMatrix.needsUpdate = true;

    const geometry = mesh.geometry;
    geometry.setAttribute(
      "aTileUvRect",
      new THREE.InstancedBufferAttribute(data.uvRects, 4),
    );
    geometry.setAttribute(
      "aTint",
      new THREE.InstancedBufferAttribute(data.tints, 3),
    );
    geometry.setAttribute(
      "aTwinkle",
      new THREE.InstancedBufferAttribute(data.twinkles, 2),
    );

    mesh.frustumCulled = false;
  }, [
    atlasTexture,
    data,
    blending,
    uTime,
    uTwinkleSpeed,
    uTwinkleAmount,
    uTwinkleSharpness,
  ]);

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, Math.max(1, data.count)]}
        frustumCulled={false}
        renderOrder={-1}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicNodeMaterial />
      </instancedMesh>
      {children}
    </>
  );
}
