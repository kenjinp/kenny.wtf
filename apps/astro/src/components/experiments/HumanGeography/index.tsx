import * as THREE from "three/webgpu";
import { Canvas, extend } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { WorldProvider } from "koota/react";
import CityMarker from "./CityMarker";
import LandUseHud from "./LandUseHud";
import { LandUseHoverProvider } from "./LandUseHoverContext";
import NeighborGraphEdges from "./NeighborGraphEdges";
import NodeSpawner from "./NodeSpawner";
import PathEdges from "./PathEdges";
import RoadEdges from "./RoadEdges";
import RiverEdges from "./RiverEdges";
import PathPickHud from "./PathPickHud";
import { PathPickProvider } from "./PathPickContext";
import Sites from "./Sites";
import Terrain from "./Terrain";
import TerrainLandUsePicker from "./TerrainLandUsePicker";
import { SiteGraphProvider } from "./siteGraphContext";
import VoronoiCellEdges from "./VoronoiCellEdges";
import { world } from "./world";

/** Debug overlay: tens of thousands of Delaunay edges — disable for frame rate. */
const SHOW_NEIGHBOR_GRAPH = false;

extend(THREE as any);

export default function HumanGeography() {
  return (
    <WorldProvider world={world}>
      <PathPickProvider>
        <SiteGraphProvider>
          <LandUseHoverProvider>
            <div className="relative h-full w-full bg-neutral-950">
              <LandUseHud />
              <PathPickHud />
              <Canvas
                className="h-full w-full"
                shadows={false}
                camera={{
                  position: [1900, 1500, 1900],
                  fov: 50,
                  near: 0.1,
                  far: 40000,
                }}
                dpr={
                  typeof window !== "undefined"
                    ? Math.min(1, window.devicePixelRatio)
                    : 1
                }
                // @ts-ignore
                gl={async (props) => {
                  const renderer = new THREE.WebGPURenderer({
                    ...props,
                    powerPreference: "high-performance",
                  } as any);
                  await renderer.init();
                  return renderer;
                }}
              >
                <NodeSpawner />
                <color attach="background" args={["#0a0a0a"]} />
                <ambientLight intensity={0.6} />
                <directionalLight position={[3, 3, 3]} intensity={1.2} />
                <Terrain />
                <TerrainLandUsePicker />
                <CityMarker />
                {/* <VoronoiCellEdges /> */}
                {/* <Sites /> */}
                {SHOW_NEIGHBOR_GRAPH ? <NeighborGraphEdges /> : null}
                <RoadEdges />
                <RiverEdges />
                <PathEdges />
                <OrbitControls enablePan />
              </Canvas>
            </div>
          </LandUseHoverProvider>
        </SiteGraphProvider>
      </PathPickProvider>
    </WorldProvider>
  );
}
