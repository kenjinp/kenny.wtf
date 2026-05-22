import { vectorSpaceToTextureSpace } from "@hello-terrain/three";
import { task, type Graph } from "@hello-terrain/work";
import { useLoader } from "@react-three/fiber";
import { folder, useControls } from "leva";
import { forwardRef, useEffect, useMemo, useRef } from "react";
import {
  clamp,
  float,
  Fn,
  mix,
  mx_noise_float,
  normalMap,
  normalView,
  normalWorld,
  oscSine,
  positionViewDirection,
  positionWorld,
  pow,
  smoothstep,
  texture,
  time,
  uniform,
  vec2,
  vec3,
} from "three/tsl";
import * as THREE from "three/webgpu";

const MASK_URL = "/assets/heightmaps/mountain_river_mask.png";

const BILLOW_EPS = 0.5;

/**
 * Layered billow noise: abs(perlin) summed across octaves with halving
 * amplitude. Returns a scalar height in roughly [0, 1].
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const billowFbm = (p: any, octaves = 3): any => {
  let v: any = float(0);
  let freq = 1;
  let amp = 0.5;
  for (let i = 0; i < octaves; i++) {
    v = v.add(mx_noise_float(p.mul(freq)).abs().mul(amp));
    freq *= 2;
    amp *= 0.5;
  }
  return v;
};

/**
 * Standard fbm: signed perlin summed across octaves. Returns roughly [-1, 1].
 * Used as the building block for domain-warped noise.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fbm = (p: any, octaves = 4): any => {
  let v: any = float(0);
  let freq = 1;
  let amp = 0.5;
  for (let i = 0; i < octaves; i++) {
    v = v.add(mx_noise_float(p.mul(freq)).mul(amp));
    freq *= 2;
    amp *= 0.5;
  }
  return v;
};

/**
 * Domain-warped fbm (Iñigo Quilez style). Samples fbm at two offset
 * positions to build a 2D offset vector `q`, then samples fbm again at the
 * position perturbed by `q * warpAmount`. Produces flowing, eddy-like
 * patterns rather than the cellular look of Worley.
 *
 * Returns a scalar in roughly [0, 1].
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const domainWarpedFbm = (p: any, warpAmount: any, octaves = 3): any => {
  const qx = fbm(p, octaves);
  const qy = fbm(p.add(vec2(5.2, 1.3)), octaves);
  const q = vec2(qx, qy);
  const warped = p.add(q.mul(warpAmount));
  return fbm(warped, octaves).mul(0.5).add(0.5);
};

/** Set a Three.Color from an sRGB hex string, working-space-corrected. */
const setColor = (target: THREE.Color, hex: string) => {
  target.set(hex).convertSRGBToLinear();
};

type TerrainMaterialProps = {
  g: Graph;
  rootSize: number;
  heightmapStrength: number;
  wireframe?: boolean;
};

export const TerrainMaterial = forwardRef<
  THREE.MeshStandardNodeMaterial,
  TerrainMaterialProps
>(function TerrainMaterial(
  { g, rootSize, heightmapStrength, wireframe = false },
  ref,
) {
  const materialNodesRef = useRef(false);

  const poolMaskTexture = useLoader(THREE.TextureLoader, MASK_URL);
  poolMaskTexture.colorSpace = THREE.NoColorSpace;
  poolMaskTexture.wrapS = THREE.ClampToEdgeWrapping;
  poolMaskTexture.wrapT = THREE.ClampToEdgeWrapping;
  poolMaskTexture.minFilter = THREE.LinearFilter;
  poolMaskTexture.magFilter = THREE.LinearFilter;

  const controls = useControls("Terrain Material", {
    Color: folder({
      colorLow: "#f29e94",
      colorMid: "#ebd6d1",
      colorHigh: "#8cc7fa",
      bandLowMidLo: { value: 0.0, min: 0, max: 1, step: 0.01 },
      bandLowMidHi: { value: 0.25, min: 0, max: 1, step: 0.01 },
      bandMidHighLo: { value: 0.3, min: 0, max: 1, step: 0.01 },
      bandMidHighHi: { value: 0.7, min: 0, max: 1, step: 0.01 },
      tintAmount: { value: 0.08, min: 0, max: 0.3, step: 0.005 },
    }),
    SSS: folder({
      sssTint: "#ffa699",
      rimPower: { value: 2.0, min: 0.5, max: 8, step: 0.1 },
      rimStrength: { value: 0.6, min: 0, max: 2, step: 0.05 },
    }),
    Pools: folder({
      poolGreen: "#80ff33",
      poolOrange: "#ff8c1a",
      poolGradientCenter: { value: 0.5, min: 0, max: 1, step: 0.01 },
      poolGradientWidth: { value: 0.45, min: 0.01, max: 1.5, step: 0.01 },
      poolDriftSpeed: { value: 0.0, min: -0.2, max: 0.2, step: 0.005 },
      poolThresholdLo: { value: 0.001, min: 0, max: 1, step: 0.01 },
      poolThresholdHi: { value: 1, min: 0, max: 1, step: 0.01 },
      poolIntensity: { value: 3, min: 0, max: 10, step: 0.05 },
      poolPulseSpeed: { value: 0.3, min: 0, max: 3, step: 0.05 },
      poolWarpScale: { value: 40, min: 0.1, max: 100, step: 0.1 },
      poolWarpAmount: { value: 6, min: 0, max: 10, step: 0.05 },
      poolWarpStrength: { value: 1, min: 0, max: 2, step: 0.01 },
      poolWarpDrift: { value: 0.04, min: 0, max: 0.5, step: 0.005 },
    }),
    Roughness: folder({
      roughnessFlat: { value: 0.95, min: 0, max: 1, step: 0.01 },
      roughnessSteep: { value: 0.7, min: 0, max: 1, step: 0.01 },
      roughnessPoolDelta: { value: 0.25, min: 0, max: 1, step: 0.01 },
    }),
    Normal: folder({
      billowFreq: { value: 0.1, min: 0.001, max: 1, step: 0.001 },
      billowStrength: { value: 1.5, min: 0, max: 5, step: 0.05 },
    }),
    metalness: { value: 0.0, min: 0, max: 1, step: 0.01 },
  });

  const u = useMemo(
    () => ({
      colorLow: uniform(new THREE.Color()),
      colorMid: uniform(new THREE.Color()),
      colorHigh: uniform(new THREE.Color()),
      sssTint: uniform(new THREE.Color()),
      poolGreen: uniform(new THREE.Color()),
      poolOrange: uniform(new THREE.Color()),
      bandLowMidLo: uniform(0),
      bandLowMidHi: uniform(0),
      bandMidHighLo: uniform(0),
      bandMidHighHi: uniform(0),
      tintAmount: uniform(0),
      rimPower: uniform(0),
      rimStrength: uniform(0),
      poolGradientCenter: uniform(0),
      poolGradientWidth: uniform(0),
      poolDriftSpeed: uniform(0),
      poolThresholdLo: uniform(0),
      poolThresholdHi: uniform(0),
      poolIntensity: uniform(0),
      poolPulseSpeed: uniform(0),
      poolWarpScale: uniform(0),
      poolWarpAmount: uniform(0),
      poolWarpStrength: uniform(0),
      poolWarpDrift: uniform(0),
      roughnessFlat: uniform(0),
      roughnessSteep: uniform(0),
      roughnessPoolDelta: uniform(0),
      billowFreq: uniform(0),
      billowStrength: uniform(0),
    }),
    [],
  );

  useEffect(() => {
    setColor(u.colorLow.value, controls.colorLow);
    setColor(u.colorMid.value, controls.colorMid);
    setColor(u.colorHigh.value, controls.colorHigh);
    setColor(u.sssTint.value, controls.sssTint);
    setColor(u.poolGreen.value, controls.poolGreen);
    setColor(u.poolOrange.value, controls.poolOrange);
    u.bandLowMidLo.value = controls.bandLowMidLo;
    u.bandLowMidHi.value = controls.bandLowMidHi;
    u.bandMidHighLo.value = controls.bandMidHighLo;
    u.bandMidHighHi.value = controls.bandMidHighHi;
    u.tintAmount.value = controls.tintAmount;
    u.rimPower.value = controls.rimPower;
    u.rimStrength.value = controls.rimStrength;
    u.poolGradientCenter.value = controls.poolGradientCenter;
    u.poolGradientWidth.value = controls.poolGradientWidth;
    u.poolDriftSpeed.value = controls.poolDriftSpeed;
    u.poolThresholdLo.value = controls.poolThresholdLo;
    u.poolThresholdHi.value = controls.poolThresholdHi;
    u.poolIntensity.value = controls.poolIntensity;
    u.poolPulseSpeed.value = controls.poolPulseSpeed;
    u.poolWarpScale.value = controls.poolWarpScale;
    u.poolWarpAmount.value = controls.poolWarpAmount;
    u.poolWarpStrength.value = controls.poolWarpStrength;
    u.poolWarpDrift.value = controls.poolWarpDrift;
    u.roughnessFlat.value = controls.roughnessFlat;
    u.roughnessSteep.value = controls.roughnessSteep;
    u.roughnessPoolDelta.value = controls.roughnessPoolDelta;
    u.billowFreq.value = controls.billowFreq;
    u.billowStrength.value = controls.billowStrength;
  }, [controls, u]);

  useEffect(() => {
    g.add(
      task((_get, work) => {
        return work(() => {
          const material = ref && "current" in ref ? ref.current : null;
          if (!material || materialNodesRef.current) return;

          const rootSizeNode = float(rootSize);
          const heightNorm = float(heightmapStrength);

          const worldUv = vec2(positionWorld.x, positionWorld.z)
            .div(rootSizeNode)
            .add(0.5);
          const h01 = clamp(positionWorld.y.div(heightNorm), 0, 1);
          const poolMask = smoothstep(
            u.poolThresholdLo,
            u.poolThresholdHi,
            texture(poolMaskTexture, worldUv).b,
          );

          material.colorNode = Fn(() => {
            const lowToMid = mix(
              u.colorLow,
              u.colorMid,
              smoothstep(u.bandLowMidLo, u.bandLowMidHi, h01),
            );
            const base = mix(
              lowToMid,
              u.colorHigh,
              smoothstep(u.bandMidHighLo, u.bandMidHighHi, h01),
            );

            const tintNoise = mx_noise_float(worldUv.mul(3.0)).mul(u.tintAmount);
            const tinted = base.add(
              vec3(tintNoise, float(0), tintNoise.negate()),
            );

            const NdotV = clamp(normalView.dot(positionViewDirection), 0, 1);
            const rim = pow(float(1).sub(NdotV), u.rimPower).mul(u.rimStrength);
            const sss = u.sssTint.mul(rim);

            return tinted.add(sss);
          })();

          material.emissiveNode = Fn(() => {
            const pulse = oscSine(time.mul(u.poolPulseSpeed)).mul(0.4).add(0.6);

            const scrolledZ = worldUv.y.add(time.mul(u.poolDriftSpeed));
            const halfWidth = u.poolGradientWidth.mul(0.5);
            const gradient = smoothstep(
              u.poolGradientCenter.sub(halfWidth),
              u.poolGradientCenter.add(halfWidth),
              scrolledZ,
            );
            const poolColor = mix(u.poolGreen, u.poolOrange, gradient);

            const warpPos = vec2(
              worldUv.x.mul(u.poolWarpScale).add(time.mul(u.poolWarpDrift)),
              worldUv.y
                .mul(u.poolWarpScale)
                .sub(time.mul(u.poolWarpDrift).mul(1.3)),
            );
            const eddyField = domainWarpedFbm(warpPos, u.poolWarpAmount, 3);
            const eddies = mix(float(1), eddyField, u.poolWarpStrength);

            return poolColor
              .mul(poolMask)
              .mul(pulse)
              .mul(eddies)
              .mul(u.poolIntensity);
          })();

          material.roughnessNode = Fn(() => {
            const slope = float(1).sub(normalWorld.y);
            const base = mix(
              u.roughnessFlat,
              u.roughnessSteep,
              smoothstep(float(0.0), float(0.6), slope),
            );
            return clamp(base.sub(poolMask.mul(u.roughnessPoolDelta)), 0.05, 1.0);
          })();

          material.normalNode = Fn(() => {
            const billowUv = vec2(positionWorld.x, positionWorld.z).mul(
              u.billowFreq,
            );
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sampleHeight = (uv: any) =>
              billowFbm(vec3(uv.x, float(0), uv.y), 3);
            const h = sampleHeight(billowUv);
            const hu = sampleHeight(billowUv.add(vec2(BILLOW_EPS, 0)));
            const hv = sampleHeight(billowUv.add(vec2(0, BILLOW_EPS)));
            const dHdu = hu.sub(h);
            const dHdv = hv.sub(h);
            const tangentNormal = vec3(
              dHdu.negate(),
              dHdv.negate(),
              float(1),
            ).normalize();
            const strength = u.billowStrength.mul(float(1).sub(poolMask));
            return normalMap(
              vectorSpaceToTextureSpace(tangentNormal),
              vec2(strength, strength),
            );
          })();

          material.aoNode = null;
          material.needsUpdate = true;
          materialNodesRef.current = true;
        });
      }).displayName("terrainMaterialNodesApplyTask"),
    );
  }, [g, poolMaskTexture, rootSize, heightmapStrength, ref, u]);

  return (
    <meshStandardNodeMaterial
      ref={ref}
      wireframe={wireframe}
      metalness={controls.metalness}
    />
  );
});
