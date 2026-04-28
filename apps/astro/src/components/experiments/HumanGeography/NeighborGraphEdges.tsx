import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
import { useQuery } from "koota/react";
import { WireTo } from "./relations";
import { Position, SiteIndex } from "./traits";
import { MAX_SITES } from "./mapConstants";

const MAX_VERTICES = MAX_SITES * 12;

export default function NeighborGraphEdges() {
  const lineRef = useRef<THREE.LineSegments>(null);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(MAX_VERTICES * 3);
    const attr = new THREE.BufferAttribute(arr, 3);
    attr.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute("position", attr);
    return g;
  }, []);

  const entities = useQuery(Position, SiteIndex);

  useLayoutEffect(() => {
    const line = lineRef.current;
    if (!line || entities.length === 0) return;

    const pos = line.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    let o = 0;

    for (const e of entities) {
      if (!e.isAlive()) continue;
      const p0 = e.get(Position);
      if (!p0) continue;
      const idA = e.id();
      for (const t of e.targetsFor(WireTo)) {
        if (!t.isAlive()) continue;
        const idB = t.id();
        if (idA >= idB) continue;
        const p1 = t.get(Position);
        if (!p1) continue;
        arr[o++] = p0.x;
        arr[o++] = 0.02;
        arr[o++] = p0.y;
        arr[o++] = p1.x;
        arr[o++] = 0.02;
        arr[o++] = p1.y;
      }
    }

    line.geometry.setDrawRange(0, o / 3);
    pos.needsUpdate = true;
  }, [entities]);

  return (
    <lineSegments ref={lineRef} geometry={geometry} frustumCulled={false}>
      <lineBasicMaterial color="#888888" toneMapped={false} />
    </lineSegments>
  );
}
