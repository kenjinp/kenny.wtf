import type { Entity } from "koota";

const id = (e: Entity) => e.id();

/**
 * A* on an arbitrary graph with per-edge cost and an admissible heuristic.
 */
export function astarWeighted(
  start: Entity,
  goal: Entity,
  neighbors: (e: Entity) => readonly Entity[],
  edgeCost: (from: Entity, to: Entity) => number,
  heuristic: (e: Entity) => number,
): Entity[] | null {
  if (start === goal) return [start];

  const g = new Map<number, number>();
  const came = new Map<number, Entity>();
  const heap: { f: number; e: Entity }[] = [];

  const bubbleUp = (c: number) => {
    while (c > 0) {
      const p = (c - 1) >> 1;
      if (heap[p]!.f <= heap[c]!.f) break;
      const t = heap[p]!;
      heap[p] = heap[c]!;
      heap[c] = t;
      c = p;
    }
  };

  const push = (e: Entity, f: number) => {
    heap.push({ f, e });
    bubbleUp(heap.length - 1);
  };

  const pop = (): { f: number; e: Entity } | undefined => {
    if (heap.length === 0) return undefined;
    const top = heap[0]!;
    const last = heap.pop()!;
    if (heap.length === 0) return top;
    heap[0] = last;
    let i = 0;
    for (;;) {
      const l = i * 2 + 1;
      const r = l + 1;
      let smallest = i;
      if (l < heap.length && heap[l]!.f < heap[smallest]!.f) smallest = l;
      if (r < heap.length && heap[r]!.f < heap[smallest]!.f) smallest = r;
      if (smallest === i) break;
      const t = heap[i]!;
      heap[i] = heap[smallest]!;
      heap[smallest] = t;
      i = smallest;
    }
    return top;
  };

  g.set(id(start), 0);
  push(start, heuristic(start));

  while (heap.length > 0) {
    const cur = pop()!;
    const e = cur.e;
    const eid = id(e);
    const ge = g.get(eid)!;
    const bestF = ge + heuristic(e);
    if (cur.f > bestF + 1e-8) continue;

    if (eid === id(goal)) {
      const path: Entity[] = [];
      let walk: Entity | undefined = goal;
      for (;;) {
        path.push(walk);
        if (id(walk) === id(start)) break;
        walk = came.get(id(walk));
        if (walk === undefined) return null;
      }
      path.reverse();
      return path;
    }

    for (const nb of neighbors(e)) {
      if (!nb.isAlive()) continue;
      const nid = id(nb);
      const w = edgeCost(e, nb);
      const tentative = ge + w;
      const prev = g.get(nid);
      if (prev === undefined || tentative < prev) {
        g.set(nid, tentative);
        came.set(nid, e);
        push(nb, tentative + heuristic(nb));
      }
    }
  }

  return null;
}
