import { useLayoutEffect, useRef } from "react";
import * as THREE from "three/webgpu";
import { lastRiverSpine } from "./infrastructureState";
import { useSiteGraph } from "./siteGraphContext";
import { Position } from "./traits";

/** River polyline + sparse downstream arrows. */
export default function RiverEdges() {
  const groupRef = useRef<THREE.Group>(null);
  const { sorted } = useSiteGraph();

  useLayoutEffect(() => {
    const g = groupRef.current;
    if (!g) return;

    const disposables: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];

    for (const c of [...g.children]) {
      g.remove(c);
      if (c instanceof THREE.Line) {
        c.geometry.dispose();
        if (!Array.isArray(c.material)) c.material.dispose();
      }
      if (
        "dispose" in c &&
        typeof (c as THREE.ArrowHelper).dispose === "function"
      ) {
        (c as THREE.ArrowHelper).dispose();
      }
    }

    const spine = lastRiverSpine;
    if (spine.length < 2) return;

    const pts: number[] = [];
    for (let k = 0; k < spine.length; k++) {
      const e = sorted[spine[k]!];
      if (!e?.isAlive()) continue;
      const p = e.get(Position)!;
      pts.push(p.x, 0.04, p.y);
    }
    if (pts.length < 6) return;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    disposables.push(geo);
    const mat = new THREE.LineBasicMaterial({
      color: "#4a90d9",
      toneMapped: false,
    });
    materials.push(mat);
    const line = new THREE.Line(geo, mat);
    g.add(line);

    const step = Math.max(1, Math.floor(spine.length / 18));
    for (let k = 0; k < spine.length - 1; k += step) {
      const ia = spine[k]!;
      const ib = spine[k + 1]!;
      const ea = sorted[ia];
      const eb = sorted[ib];
      if (!ea?.isAlive() || !eb?.isAlive()) continue;
      const pa = ea.get(Position)!;
      const pb = eb.get(Position)!;
      const mx = (pa.x + pb.x) * 0.5;
      const mz = (pa.y + pb.y) * 0.5;
      const dx = pb.x - pa.x;
      const dz = pb.y - pa.y;
      const len = Math.hypot(dx, dz) || 1;
      const dir = new THREE.Vector3(dx / len, 0, dz / len);
      const origin = new THREE.Vector3(mx, 0.07, mz);
      const ah = new THREE.ArrowHelper(
        dir,
        origin,
        Math.min(36, len * 0.5),
        "#9fd4ff",
        12,
        8,
      );
      g.add(ah);
    }

    return () => {
      for (const geo of disposables) geo.dispose();
      for (const m of materials) m.dispose();
    };
  }, [sorted]);

  return <group ref={groupRef} />;
}
