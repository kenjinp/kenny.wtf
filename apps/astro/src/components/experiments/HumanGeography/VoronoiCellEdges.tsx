import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
import { terrainVoronoiBounds } from "./mapBounds";
import { MAX_SITES } from "./mapConstants";
import { useSiteGraph } from "./siteGraphContext";

/** Worst-case line verts: many-sided cells; cap draw range if exceeded. */
const MAX_VERTICES = Math.min(MAX_SITES * 48, 400_000);

export default function VoronoiCellEdges() {
  const { sorted, delaunay } = useSiteGraph();
  const lineRef = useRef<THREE.LineSegments>(null);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(MAX_VERTICES * 3);
    const attr = new THREE.BufferAttribute(arr, 3);
    attr.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute("position", attr);
    return g;
  }, []);

  useLayoutEffect(() => {
    const line = lineRef.current;
    if (!line || !delaunay || sorted.length < 3) {
      line?.geometry.setDrawRange(0, 0);
      return;
    }

    const vor = delaunay.voronoi(terrainVoronoiBounds());

    const pos = line.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    let o = 0;

    const pushSeg = (ax: number, az: number, bx: number, bz: number) => {
      if (o + 6 > arr.length) return;
      arr[o++] = ax;
      arr[o++] = 0.01;
      arr[o++] = az;
      arr[o++] = bx;
      arr[o++] = 0.01;
      arr[o++] = bz;
    };

    for (let i = 0; i < sorted.length; i++) {
      const poly = vor.cellPolygon(i);
      if (!poly || poly.length < 2) continue;
      for (let k = 0; k < poly.length - 1; k++) {
        const a = poly[k]!;
        const b = poly[k + 1]!;
        pushSeg(a[0]!, a[1]!, b[0]!, b[1]!);
      }
    }

    line.geometry.setDrawRange(0, o / 3);
    pos.needsUpdate = true;
  }, [delaunay, sorted]);

  return (
    <lineSegments ref={lineRef} geometry={geometry} frustumCulled={false}>
      <lineBasicMaterial color="#444444" toneMapped={false} />
    </lineSegments>
  );
}
