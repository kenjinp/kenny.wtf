import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
import { usePathPick } from "./PathPickContext";
import { MAX_SITES } from "./mapConstants";
import { useSiteGraph } from "./siteGraphContext";
import { Color, Position } from "./traits";

const dummy = new THREE.Object3D();
const CUBE = 10;

const PATH_R = 251 / 255;
const PATH_G = 191 / 255;
const PATH_B = 36 / 255;
const SRC_R = 34 / 255;
const SRC_G = 211 / 255;
const SRC_B = 238 / 255;
const SINK_R = 251 / 255;
const SINK_G = 113 / 255;
const SINK_B = 133 / 255;

export default function Sites() {
  const { sorted } = useSiteGraph();
  const ref = useRef<THREE.InstancedMesh>(null);
  const {
    pathEntities,
    bKeyDown,
    onPathNodePicked,
    phase,
    sourceEntity,
    sinkEntity,
  } = usePathPick();

  const pathIdSet = useMemo(() => {
    if (!pathEntities || pathEntities.length === 0) return null;
    return new Set(pathEntities.map((e) => e.id()));
  }, [pathEntities]);

  const colorAttr = useMemo(
    () =>
      new THREE.InstancedBufferAttribute(new Float32Array(MAX_SITES * 3), 3),
    [],
  );

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    if (!mesh.instanceColor) mesh.instanceColor = colorAttr;
    const sourceId = sourceEntity?.isAlive() ? sourceEntity.id() : null;
    const sinkId =
      sinkEntity?.isAlive() && phase === "done" ? sinkEntity.id() : null;

    const arr = colorAttr.array as Float32Array;
    for (let i = 0; i < sorted.length; i++) {
      const entity = sorted[i]!;
      const p = entity.get(Position)!;
      const c = entity.get(Color)!;
      dummy.position.set(p.x, CUBE / 2, p.y);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      const eid = entity.id();
      if (sourceId !== null && eid === sourceId) {
        arr[i * 3] = SRC_R;
        arr[i * 3 + 1] = SRC_G;
        arr[i * 3 + 2] = SRC_B;
      } else if (sinkId !== null && eid === sinkId) {
        arr[i * 3] = SINK_R;
        arr[i * 3 + 1] = SINK_G;
        arr[i * 3 + 2] = SINK_B;
      } else if (pathIdSet?.has(eid)) {
        arr[i * 3] = PATH_R;
        arr[i * 3 + 1] = PATH_G;
        arr[i * 3 + 2] = PATH_B;
      } else {
        arr[i * 3] = c.r;
        arr[i * 3 + 1] = c.g;
        arr[i * 3 + 2] = c.b;
      }
    }
    mesh.count = sorted.length;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    mesh.computeBoundingBox();
    colorAttr.needsUpdate = true;
  }, [sorted, colorAttr, pathIdSet, phase, sourceEntity, sinkEntity]);

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, MAX_SITES]}
      onPointerDown={(e) => {
        e.stopPropagation();
        if (!bKeyDown || e.instanceId === undefined) return;
        const entity = sorted[e.instanceId];
        if (!entity?.isAlive()) return;
        onPathNodePicked(entity);
      }}
    >
      <boxGeometry args={[CUBE, CUBE, CUBE]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}
