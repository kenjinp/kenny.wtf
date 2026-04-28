import { useEffect, useMemo } from "react";
import * as THREE from "three/webgpu";
import { texture as tslTexture } from "three/tsl";
import { TERRAIN_SEGMENTS, TERRAIN_SIZE } from "./terrainConstants";
import { useSiteGraph } from "./siteGraphContext";
import {
  buildTerrainLandUseDataTexture,
  terrainRasterUploadKey,
} from "./terrainRasterTexture";

export { TERRAIN_SEGMENTS, TERRAIN_SIZE } from "./terrainConstants";

function noopRaycast() {}

export default function Terrain() {
  const { sorted, delaunay, siteCount } = useSiteGraph();

  const uploadKey = useMemo(
    () => terrainRasterUploadKey(sorted),
    [sorted, sorted.length, siteCount],
  );

  const landUseMap = useMemo(() => {
    if (!delaunay || sorted.length < 3) return null;
    return buildTerrainLandUseDataTexture(sorted, delaunay);
  }, [uploadKey, delaunay, sorted]);

  const material = useMemo(() => {
    if (!landUseMap) return null;
    const mat = new THREE.MeshBasicNodeMaterial({ toneMapped: false });
    mat.colorNode = tslTexture(landUseMap);
    return mat;
  }, [landUseMap]);

  useEffect(() => {
    return () => {
      landUseMap?.dispose();
    };
  }, [landUseMap]);

  useEffect(() => {
    return () => {
      material?.dispose();
    };
  }, [material]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={noopRaycast as never}>
      <planeGeometry
        args={[TERRAIN_SIZE, TERRAIN_SIZE, TERRAIN_SEGMENTS, TERRAIN_SEGMENTS]}
      />
      {material ? (
        <primitive object={material} attach="material" />
      ) : (
        <meshBasicMaterial color="#1a1a24" toneMapped={false} />
      )}
    </mesh>
  );
}
