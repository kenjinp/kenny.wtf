import {
  compileComputeTask,
  createElevationFieldContextTask,
  createTerrainFieldStorage,
  createTerrainSamplerTask,
  createUniformsTask,
  elevationFieldStageTask,
  elevationFn,
  elevationScale,
  executeComputeTask,
  gpuSpatialIndexStorageTask,
  gpuSpatialIndexUploadTask,
  innerTileSegments,
  instanceIdTask,
  leafGpuBufferTask,
  leafStorageTask,
  maxLevel,
  maxNodes,
  positionNodeTask,
  quadtreeConfigTask,
  quadtreeUpdate,
  quadtreeUpdateTask,
  rootSize,
  skirtScale,
  surfaceTask,
  terrainFieldFilter,
  terrainFieldStageTask,
  TerrainGeometry,
  TerrainMesh,
  tileNodesTask,
  updateUniformsTask,
  type ElevationCallback,
  type TerrainGraph,
  type UpdateParams,
} from "@hello-terrain/three";
import { graph, task, type Graph } from "@hello-terrain/work";
import { Billboard, OrbitControls, useTexture } from "@react-three/drei";
import {
  Canvas,
  extend,
  useFrame,
  useLoader,
  useThree,
} from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import type { WebGPURendererParameters } from "three/src/renderers/webgpu/WebGPURenderer.js";
import { float, texture } from "three/tsl";
import * as THREE from "three/webgpu";
import ccnycUrl from "./ccnyc.png";
import { R16HeightmapLoader } from "./r16HeightmapLoader";
import { Skybox } from "./Skybox";
import { Stars } from "./Stars";
import { TerrainMaterial } from "./TerrainMaterial";

extend(THREE as any);
extend({ TerrainGeometry, TerrainMesh });

function MarqueeOverlay() {
  const text = "Pier 57, Tuesdays 6-8pm";
  const repeats = 8;

  return (
    <>
      <style>{`
        @keyframes ccnyc-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 overflow-hidden border-t-[2px] border-[#72f19b] bg-black/40 py-3"
        aria-hidden
      >
        <div
          className="flex w-max whitespace-nowrap"
          style={{ animation: "ccnyc-marquee 100s linear infinite" }}
        >
          {Array.from({ length: repeats * 2 }).map((_, i) => (
            <span
              key={i}
              className="px-6 font-mono text-[64px] uppercase tracking-[0.3em] text-[#72f19b]"
            >
              {text} •
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

function CameraPositionLogger() {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls) as {
    target?: THREE.Vector3;
  } | null;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "c" && event.key !== "C") return;
      const target = controls?.target;
      const { x, y, z } = camera.position;
      console.log("[camera] position:", [x, y, z]);
      if (target) {
        console.log("[camera] target:", [target.x, target.y, target.z]);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [camera, controls]);

  return null;
}

const HEIGHTMAP_URL = "/assets/heightmaps/mountain_river.r16";

const CCNYC_ASPECT = 1457 / 1006;
const CCNYC_BILLBOARD_HEIGHT = 120;

const CCNYC_TEXTURE_URL = ccnycUrl.src;

/** Full-float tile field avoids half-float quantization bands on large height scales. */
function ccnycTerrainGraph(): TerrainGraph {
  const terrainFieldTextureTask = task<{ renderer: THREE.WebGPURenderer }>(
    (get, work, { resources }) => {
      const edgeVertexCount = get(innerTileSegments) + 3;
      const maxNodesValue = get(maxNodes);
      const filter = get(terrainFieldFilter);
      return work(() =>
        createTerrainFieldStorage(
          edgeVertexCount,
          maxNodesValue,
          resources?.renderer,
          { filter, format: "rgba32float" },
        ),
      );
    },
  ).displayName("createTerrainFieldTextureTask");

  return graph<{ renderer: THREE.WebGPURenderer }>()
    .add(instanceIdTask)
    .add(quadtreeConfigTask)
    .add(quadtreeUpdateTask)
    .add(leafStorageTask)
    .add(surfaceTask)
    .add(leafGpuBufferTask)
    .add(gpuSpatialIndexStorageTask)
    .add(gpuSpatialIndexUploadTask)
    .add(createUniformsTask)
    .add(updateUniformsTask)
    .add(positionNodeTask)
    .add(createElevationFieldContextTask)
    .add(tileNodesTask)
    .add(terrainFieldTextureTask)
    .add(createTerrainSamplerTask)
    .add(elevationFieldStageTask)
    .add(terrainFieldStageTask)
    .add(compileComputeTask)
    .add(executeComputeTask);
}

useTexture.preload(CCNYC_TEXTURE_URL);

function CcnycBillboard() {
  const texture = useTexture(CCNYC_TEXTURE_URL);
  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <Billboard position={[-20, 60, 20]}>
      <mesh renderOrder={1}>
        <planeGeometry
          args={[CCNYC_BILLBOARD_HEIGHT * CCNYC_ASPECT, CCNYC_BILLBOARD_HEIGHT]}
        />
        <meshBasicMaterial
          map={texture}
          color={"#72f19b"}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </Billboard>
  );
}

/** Defaults from hello-terrain docs TerrainElevationScene leva panel. */
const TERRAIN = {
  /** Match 4096² R16 heightmap (1 texel ≈ 1 world unit at the root tile). */
  rootSize: 1024,
  maxLevel: 12,
  maxNodes: 1028,
  skirtScale: 10,
  /** Keep at 1; vertical scale comes from heightmapStrength in the elevation callback. */
  elevationScale: 1,
  /** uint16 samples are normalized to 0–1 before this multiplier is applied. */
  heightmapStrength: 400,
  wireframe: false,
  innerTileSegments: 61,
} as const;

type TerrainMeshSceneImplProps = {
  g: Graph;
};

function TerrainMeshSceneImpl({ g }: TerrainMeshSceneImplProps) {
  const heightmapTexture = useLoader(R16HeightmapLoader, HEIGHTMAP_URL);
  heightmapTexture.wrapS = heightmapTexture.wrapT = THREE.ClampToEdgeWrapping;
  heightmapTexture.minFilter = THREE.LinearFilter;
  heightmapTexture.magFilter = THREE.LinearFilter;

  const lastCameraRef = useRef(new THREE.Vector3());
  const meshRef = useRef<THREE.InstancedMesh | null>(null);
  const materialRef = useRef<THREE.MeshStandardNodeMaterial | null>(null);

  useEffect(() => {
    g.set(maxNodes, () => TERRAIN.maxNodes);
    g.set(rootSize, () => TERRAIN.rootSize);
    g.set(maxLevel, () => TERRAIN.maxLevel);
    g.set(skirtScale, () => TERRAIN.skirtScale);
    g.set(elevationScale, () => TERRAIN.elevationScale);
    g.set(innerTileSegments, () => TERRAIN.innerTileSegments);
  }, [g]);

  useEffect(() => {
    const bboxMin = new THREE.Vector3();
    const bboxMax = new THREE.Vector3();

    g.add(
      task((get, work) => {
        const leafSet = get(quadtreeUpdateTask);
        const positionNode = get(positionNodeTask);
        return work(() => {
          const mesh = meshRef.current;
          const material = materialRef.current;

          if (
            mesh &&
            leafSet?.count !== undefined &&
            leafSet.count !== mesh.count
          ) {
            mesh.count = leafSet.count;
            mesh.instanceMatrix.needsUpdate = true;
          }

          if (mesh) {
            const halfRoot = TERRAIN.rootSize * 0.5;
            if (!mesh.geometry.boundingBox) {
              mesh.geometry.boundingBox = new THREE.Box3();
            }
            if (!mesh.geometry.boundingSphere) {
              mesh.geometry.boundingSphere = new THREE.Sphere();
            }

            bboxMin.set(-halfRoot, 0, -halfRoot);
            bboxMax.set(halfRoot, TERRAIN.heightmapStrength, halfRoot);
            mesh.geometry.boundingBox.set(bboxMin, bboxMax);
            mesh.geometry.boundingBox.getBoundingSphere(
              mesh.geometry.boundingSphere,
            );
          }

          if (material && positionNode) {
            material.positionNode = positionNode;
            material.needsUpdate = true;
          }
        });
      }).displayName("materialPositionNodeApplyTask"),
    );
  }, [g]);

  useEffect(() => {
    const elevation: ElevationCallback = ({ rootUV }) => {
      return texture(heightmapTexture, rootUV).x.mul(
        float(TERRAIN.heightmapStrength),
      );
    };
    g.set(elevationFn, () => elevation);
  }, [g, heightmapTexture]);

  useFrame(async ({ camera, gl }) => {
    const cameraHysteresis = 0.05;
    if (
      lastCameraRef.current.distanceToSquared(camera.position) >=
      cameraHysteresis * cameraHysteresis
    ) {
      g.set(quadtreeUpdate, (prev: UpdateParams) => {
        prev.cameraOrigin.x = camera.position.x;
        prev.cameraOrigin.y = camera.position.y;
        prev.cameraOrigin.z = camera.position.z;
        return prev;
      });
      lastCameraRef.current.copy(camera.position);
    }

    await g.run({
      resources: {
        renderer: gl,
      },
    });
  });

  return (
    <>
      <Suspense fallback={null}>
        <CcnycBillboard />
      </Suspense>

      <terrainMesh
        ref={meshRef}
        innerTileSegments={TERRAIN.innerTileSegments}
        maxNodes={TERRAIN.maxNodes}
      >
        <TerrainMaterial
          g={g}
          ref={materialRef}
          wireframe={TERRAIN.wireframe}
          rootSize={TERRAIN.rootSize}
          heightmapStrength={TERRAIN.heightmapStrength}
        />
      </terrainMesh>
    </>
  );
}

export default function TerrainElevationScene() {
  const g = useMemo(() => ccnycTerrainGraph(), []);

  return (
    <div className="p-12 relative flex h-full w-full touch-none items-center justify-center bg-black gap-10">
      <div className="relative aspect-[1080/1920] h-full max-h-full w-auto max-w-full bg-neutral-950">
        <Canvas
          className="h-full w-full"
          shadows
          gl={async (props) => {
            props.alpha = true;
            props.antialias = true;
            const renderer = new THREE.WebGPURenderer({
              ...(props as WebGPURendererParameters),
              logarithmicDepthBuffer: true,
            });
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.shadowMap.enabled = true;
            await renderer.init();
            return renderer;
          }}
          camera={{
            near: 0.001,
            far: Number.MAX_SAFE_INTEGER,
            position: [
              269.5317108828801, 40.52457873883865, 105.59194546191813,
            ],
          }}
          dpr={[1, 1]}
          performance={{ min: 0.5 }}
        >
          <ambientLight intensity={0.2} />
          {/* <directionalLight intensity={1} position={[1, 1, 1]} /> */}
          <directionalLight
            intensity={0.5}
            position={new THREE.Vector3(-1, 1, -2).normalize().negate()}
            color="purple"
          />
          <TerrainMeshSceneImpl g={g} />
          <OrbitControls
            makeDefault
            target={[-20, 60, 20]}
            autoRotate
            autoRotateSpeed={0.025}
          />
          <CameraPositionLogger />
          <Suspense fallback={null}>
            <Skybox>
              <Stars>
                {({ radius }) => {
                  // Anchor the key light on the star shell so it rides with
                  // the spinning sky — a moving "sun" that orbits in lockstep
                  // with the cubemap and the stars.
                  const dir = new THREE.Vector3(-1, 1, -1)
                    .normalize()
                    .multiplyScalar(radius);
                  return (
                    <directionalLight
                      intensity={0.5}
                      position={[dir.x, dir.y, dir.z]}
                      color="white"
                    />
                  );
                }}
              </Stars>
            </Skybox>
          </Suspense>
        </Canvas>
        <MarqueeOverlay />
      </div>
      <p>Poster for Creative Coding NYC May 26</p>
    </div>
  );
}
