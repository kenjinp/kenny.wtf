/**
 * Single-source shortest paths on a non-negative weighted directed graph.
 */

export function dijkstraFromSource(
  adj: ReadonlyArray<ReadonlyArray<{ to: number; w: number }>>,
  source: number,
): Float64Array {
  const n = adj.length;
  const dist = new Float64Array(n);
  dist.fill(Number.POSITIVE_INFINITY);
  dist[source] = 0;

  const heap: { u: number; d: number }[] = [];

  const bubbleUp = (c: number) => {
    while (c > 0) {
      const p = (c - 1) >> 1;
      if (heap[p]!.d <= heap[c]!.d) break;
      const t = heap[p]!;
      heap[p] = heap[c]!;
      heap[c] = t;
      c = p;
    }
  };

  const push = (u: number, d: number) => {
    heap.push({ u, d });
    bubbleUp(heap.length - 1);
  };

  const pop = (): { u: number; d: number } | undefined => {
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
      if (l < heap.length && heap[l]!.d < heap[smallest]!.d) smallest = l;
      if (r < heap.length && heap[r]!.d < heap[smallest]!.d) smallest = r;
      if (smallest === i) break;
      const t = heap[i]!;
      heap[i] = heap[smallest]!;
      heap[smallest] = t;
      i = smallest;
    }
    return top;
  };

  push(source, 0);

  while (heap.length > 0) {
    const cur = pop()!;
    const u = cur.u;
    const d = cur.d;
    if (d > dist[u] + 1e-12) continue;

    const outs = adj[u];
    if (!outs) continue;
    for (const { to: v, w } of outs) {
      const nd = d + w;
      if (nd < dist[v]) {
        dist[v] = nd;
        push(v, nd);
      }
    }
  }

  return dist;
}
