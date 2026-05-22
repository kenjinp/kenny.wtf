import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
import { usePathPick } from "./PathPickContext";
import { MAX_SITES } from "./mapConstants";
import { Position } from "./traits";

const MAX_PATH_VERTICES = MAX_SITES * 4;

export default function PathEdges() {
  const lineRef = useRef<THREE.LineSegments>(null);
  const { pathEntities } = usePathPick();

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(MAX_PATH_VERTICES * 3);
    const attr = new THREE.BufferAttribute(arr, 3);
    attr.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute("position", attr);
    return g;
  }, []);

  useLayoutEffect(() => {
    const line = lineRef.current;
    if (!line) return;
    if (!pathEntities || pathEntities.length < 2) {
      line.geometry.setDrawRange(0, 0);
      return;
    }
    const pos = line.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    let o = 0;
    for (let k = 0; k < pathEntities.length - 1; k++) {
      const e0 = pathEntities[k]!;
      const e1 = pathEntities[k + 1]!;
      if (!e0.isAlive() || !e1.isAlive()) continue;
      const p0 = e0.get(Position);
      const p1 = e1.get(Position);
      if (!p0 || !p1) continue;
      arr[o++] = p0.x;
      arr[o++] = 0;
      arr[o++] = p0.y;
      arr[o++] = p1.x;
      arr[o++] = 0;
      arr[o++] = p1.y;
    }
    line.geometry.setDrawRange(0, o / 3);
    pos.needsUpdate = true;
  }, [pathEntities]);

  return pathEntities && pathEntities.length >= 2 ? (
    <lineSegments
      ref={lineRef}
      geometry={geometry}
      frustumCulled={false}
      renderOrder={1}
    >
      <lineBasicMaterial color="#fbbf24" toneMapped={false} />
    </lineSegments>
  ) : null;
}
