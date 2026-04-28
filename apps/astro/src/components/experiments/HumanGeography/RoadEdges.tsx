import { useLayoutEffect, useRef } from "react";
import * as THREE from "three/webgpu";
import { lastRoadSpine } from "./infrastructureState";
import { useSiteGraph } from "./siteGraphContext";
import { Position } from "./traits";

/** Renders the generated road spine (tan line above terrain). */
export default function RoadEdges() {
  const groupRef = useRef<THREE.Group>(null);
  const { sorted } = useSiteGraph();

  useLayoutEffect(() => {
    const g = groupRef.current;
    if (!g) return;

    for (const c of [...g.children]) {
      g.remove(c);
      if (c instanceof THREE.Line) {
        c.geometry.dispose();
        if (!Array.isArray(c.material)) c.material.dispose();
      }
    }

    const spine = lastRoadSpine;
    if (spine.length < 2) return;

    const pts: number[] = [];
    for (let k = 0; k < spine.length; k++) {
      const e = sorted[spine[k]!];
      if (!e?.isAlive()) continue;
      const p = e.get(Position)!;
      pts.push(p.x, 0.055, p.y);
    }
    if (pts.length < 6) return;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    const mat = new THREE.LineBasicMaterial({
      color: "#c9a06c",
      toneMapped: false,
    });
    const line = new THREE.Line(geo, mat);
    g.add(line);

    return () => {
      geo.dispose();
      mat.dispose();
    };
  }, [sorted]);

  return <group ref={groupRef} />;
}
