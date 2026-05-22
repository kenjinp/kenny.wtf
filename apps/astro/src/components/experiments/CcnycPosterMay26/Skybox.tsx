import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { folder, useControls } from "leva";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import {
  color,
  cubeTexture,
  mix,
  normalWorld,
  positionWorldDirection,
  uniform,
} from "three/tsl";
import * as THREE from "three/webgpu";

const TMP_QUAT = new THREE.Quaternion();
const TMP_MAT4 = new THREE.Matrix4();

const CUBEMAP_URL = "/assets/materials/skybox/cubemap.png";

/**
 * Horizontal-cross layout cell coordinates (col, row) in Three's cube face
 * order: [+X, -X, +Y, -Y, +Z, -Z]. Expects a 4×3 cross with +Z (front) at the
 * center and -Z (back) wrapped to the far right.
 */
const CROSS_FACE_POSITIONS: ReadonlyArray<readonly [number, number]> = [
  [2, 1], // +X right
  [0, 1], // -X left
  [1, 0], // +Y top
  [1, 2], // -Y bottom
  [1, 1], // +Z front
  [3, 1], // -Z back
] as const;

/**
 * Loads a single horizontal-cross cubemap PNG and slices it into 6 face
 * canvases that a `THREE.CubeTexture` can consume directly.
 */
class CrossCubeTextureLoader extends THREE.Loader<THREE.CubeTexture> {
  load(
    url: string,
    onLoad: (texture: THREE.CubeTexture) => void,
    _onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
  ): void {
    const img = new Image();
    if (this.crossOrigin) img.crossOrigin = this.crossOrigin;
    img.onload = () => {
      const faceSize = img.width / 4;
      const faces = CROSS_FACE_POSITIONS.map(([col, row]) => {
        const canvas = document.createElement("canvas");
        canvas.width = faceSize;
        canvas.height = faceSize;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error(
            "Failed to acquire 2d context while slicing cube faces.",
          );
        }
        ctx.drawImage(
          img,
          col * faceSize,
          row * faceSize,
          faceSize,
          faceSize,
          0,
          0,
          faceSize,
          faceSize,
        );
        return canvas;
      });
      // Build the texture fully-formed so colorSpace is set before the
      // renderer first uploads it — avoids a one-frame flash of "raw" data.
      const texture = new THREE.CubeTexture(faces);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
      onLoad(texture);
    };
    img.onerror = (err) => onError?.(err);
    img.src = url;
  }
}

const BOTTOM_COLOR = "#070108";
const TOP_COLOR = "#102032";

/**
 * Mulberry32 — small deterministic PRNG. Lets the spin axis stay stable per
 * `spinAxisSeed` so reseeding shuffles the axis predictably.
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

type SkyboxProps = {
  children?: ReactNode;
};

/**
 * Skybox owns the sky orientation: it spins a `<group>` around a fixed world
 * axis and mirrors that rotation onto `scene.backgroundRotation` /
 * `scene.environmentRotation` so the cubemap turns in lockstep with whatever
 * lives inside the group (e.g. the star shell).
 */
export function Skybox({ children }: SkyboxProps) {
  const scene = useThree((s) => s.scene);
  const cubeMap = useLoader(CrossCubeTextureLoader, CUBEMAP_URL);

  const { spin, spinSpeed, spinAxisSeed, cubeIntensity, gradientOpacity } =
    useControls("Sky", {
      Look: folder({
        // Multiplies the cubemap sample. Source PNGs are dim, so values > 1
        // let the nebula read without losing the inky base.
        cubeIntensity: { value: 2.0, min: 0, max: 10, step: 0.05 },
        // 0 = pure cubemap, 1 = pure horizon-to-zenith gradient.
        gradientOpacity: { value: 0.5, min: 0, max: 1, step: 0.01 },
      }),
      Spin: folder({
        spin: true,
        // Radians per second. Negative reverses direction.
        spinSpeed: { value: 0.05, min: -2, max: 2, step: 0.005 },
        spinAxisSeed: { value: 7, min: 0, max: 1000, step: 1 },
      }),
    });

  const spinAxis = useMemo(() => {
    // Uniform random point on the unit sphere — stable per seed.
    const rand = mulberry32(spinAxisSeed * 7919 + 3);
    const u = rand();
    const v = rand();
    const theta = u * Math.PI * 2;
    const phi = Math.acos(2 * v - 1);
    const sinPhi = Math.sin(phi);
    return new THREE.Vector3(
      sinPhi * Math.cos(theta),
      sinPhi * Math.sin(theta),
      Math.cos(phi),
    );
  }, [spinAxisSeed]);

  // `scene.backgroundRotation` only affects Three's default background path —
  // since we override with `scene.backgroundNode` below, we have to rotate the
  // sample direction ourselves via this uniform.
  const uSkyRotation = useMemo(() => uniform(new THREE.Matrix3()), []);
  const uCubeIntensity = useMemo(() => uniform(1), []);
  const uGradientOpacity = useMemo(() => uniform(0), []);

  useEffect(() => {
    uCubeIntensity.value = cubeIntensity;
    uGradientOpacity.value = gradientOpacity;
  }, [cubeIntensity, gradientOpacity, uCubeIntensity, uGradientOpacity]);

  const backgroundNode = useMemo(() => {
    // Sample the cube at `R^-1 * worldDir` so the visible sky rotates by the
    // same R as the group (and therefore matches the children riding it).
    const dir = uSkyRotation.mul(positionWorldDirection);
    const sky = cubeTexture(cubeMap, dir).mul(uCubeIntensity);
    // Remap y∈[-1,1] to t∈[0,1] (was `.mul(1).add(1)` which saturated the
    // entire upper hemisphere to TOP_COLOR — i.e. no visible gradient).
    const t = normalWorld.y.mul(0.5).add(0.5).saturate();
    const gradient = mix(color(BOTTOM_COLOR), color(TOP_COLOR), t);
    return mix(sky, gradient, uGradientOpacity);
  }, [cubeMap, uSkyRotation, uCubeIntensity, uGradientOpacity]);

  useEffect(() => {
    const prevBackground = scene.background;
    const prevBackgroundNode = scene.backgroundNode;
    const prevEnvironment = scene.environment;
    const prevEnvironmentRotation = scene.environmentRotation.clone();
    scene.background = cubeMap;
    scene.environment = cubeMap;
    scene.backgroundNode = backgroundNode;
    return () => {
      scene.background = prevBackground;
      scene.environment = prevEnvironment;
      scene.backgroundNode = prevBackgroundNode;
      scene.environmentRotation.copy(prevEnvironmentRotation);
    };
  }, [scene, backgroundNode, cubeMap]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    if (spin && spinSpeed !== 0) {
      // Rotate around a fixed world axis so the axis itself doesn't drift as
      // rotations accumulate.
      group.rotateOnWorldAxis(spinAxis, spinSpeed * delta);
    }

    // Background: bake the inverse rotation into the cube sampler uniform.
    TMP_QUAT.copy(group.quaternion).invert();
    TMP_MAT4.makeRotationFromQuaternion(TMP_QUAT);
    uSkyRotation.value.setFromMatrix4(TMP_MAT4);

    // Environment IBL uses Three's built-in path which already accounts for
    // the rotation convention internally, so feed it the forward quaternion.
    scene.environmentRotation.setFromQuaternion(group.quaternion);
  });

  return <group ref={groupRef}>{children}</group>;
}
