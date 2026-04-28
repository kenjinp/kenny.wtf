import { TERRAIN_SIZE } from "./terrainConstants";
import { useLandUseHover } from "./LandUseHoverContext";
import { useSiteGraph } from "./siteGraphContext";

/**
 * Invisible plane over the terrain for Voronoi-cell hover (deduces cell via Delaunay.find).
 */
export default function TerrainLandUsePicker() {
  const { delaunay } = useSiteGraph();
  const { setHover } = useLandUseHover();

  if (!delaunay) return null;

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.03, 0]}
      onPointerMove={(e) => {
        e.stopPropagation();
        const { x, z } = e.point;
        const i = delaunay.find(x, z);
        setHover({
          siteIndex: i,
          clientX: e.nativeEvent.clientX,
          clientY: e.nativeEvent.clientY,
        });
      }}
      onPointerOut={() => setHover(null)}
    >
      <planeGeometry args={[TERRAIN_SIZE, TERRAIN_SIZE]} />
      <meshBasicMaterial
        transparent
        opacity={0}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
