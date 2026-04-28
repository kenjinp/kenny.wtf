import {
  COST_LAND,
  COST_RIVER_CROSSING,
  COST_RIVER_DOWNSTREAM,
  COST_RIVER_UPSTREAM,
  COST_ROAD,
  RIVER_CROSSING_DISTANCE,
} from "./transportConstants";

function edgeKey(i: number, j: number): string {
  return i < j ? `${i}-${j}` : `${j}-${i}`;
}

function riverDownKey(i: number, j: number): string {
  return `${i}->${j}`;
}

function distPointToSegment2D(
  px: number,
  pz: number,
  ax: number,
  az: number,
  bx: number,
  bz: number,
): number {
  const abx = bx - ax;
  const abz = bz - az;
  const apx = px - ax;
  const apz = pz - az;
  const ab2 = abx * abx + abz * abz;
  if (ab2 < 1e-12) return Math.hypot(apx, apz);
  let t = (apx * abx + apz * abz) / ab2;
  t = Math.max(0, Math.min(1, t));
  const qx = ax + t * abx;
  const qz = az + t * abz;
  return Math.hypot(px - qx, pz - qz);
}

function midpointNearRiverPolyline(
  mx: number,
  mz: number,
  riverSpine: number[],
  coords: Float64Array | ArrayLike<number>,
): boolean {
  if (riverSpine.length < 2) return false;
  for (let k = 0; k < riverSpine.length - 1; k++) {
    const ia = riverSpine[k]!;
    const ib = riverSpine[k + 1]!;
    const ax = coords[2 * ia]!;
    const az = coords[2 * ia + 1]!;
    const bx = coords[2 * ib]!;
    const bz = coords[2 * ib + 1]!;
    const d = distPointToSegment2D(mx, mz, ax, az, bx, bz);
    if (d < RIVER_CROSSING_DISTANCE) return true;
  }
  return false;
}

function roadSetFromSpine(roadSpine: number[]): Set<string> {
  const s = new Set<string>();
  for (let k = 0; k < roadSpine.length - 1; k++) {
    s.add(edgeKey(roadSpine[k]!, roadSpine[k + 1]!));
  }
  return s;
}

function riverDownSetFromSpine(riverSpine: number[]): Set<string> {
  const s = new Set<string>();
  for (let k = 0; k < riverSpine.length - 1; k++) {
    s.add(riverDownKey(riverSpine[k]!, riverSpine[k + 1]!));
  }
  return s;
}

function directedWeight(
  i: number,
  j: number,
  L: number,
  roadSet: Set<string>,
  riverDown: Set<string>,
  riverSpine: number[],
  coords: Float64Array | ArrayLike<number>,
): number {
  const ek = edgeKey(i, j);
  if (roadSet.has(ek)) return COST_ROAD * L;
  if (riverDown.has(riverDownKey(i, j))) return COST_RIVER_DOWNSTREAM * L;
  if (riverDown.has(riverDownKey(j, i))) return COST_RIVER_UPSTREAM * L;

  const mx = (coords[2 * i]! + coords[2 * j]!) * 0.5;
  const mz = (coords[2 * i + 1]! + coords[2 * j + 1]!) * 0.5;
  if (!roadSet.has(ek) && midpointNearRiverPolyline(mx, mz, riverSpine, coords)) {
    return COST_RIVER_CROSSING * L;
  }
  return COST_LAND * L;
}

/**
 * Directed weighted adjacency for each Voronoi neighbor edge (two directed arcs).
 */
export function buildDirectedAdjacency(
  siteCount: number,
  neighborPairs: readonly [number, number][],
  coords: Float64Array | ArrayLike<number>,
  roadSpine: number[],
  riverSpine: number[],
): { to: number; w: number }[][] {
  const roadSet = roadSetFromSpine(roadSpine);
  const riverDown = riverDownSetFromSpine(riverSpine);

  const adj: { to: number; w: number }[][] = Array.from(
    { length: siteCount },
    () => [],
  );

  for (const [i, j] of neighborPairs) {
    const xi = coords[2 * i]!;
    const zi = coords[2 * i + 1]!;
    const xj = coords[2 * j]!;
    const zj = coords[2 * j + 1]!;
    const L = Math.hypot(xi - xj, zi - zj);
    const wij = directedWeight(i, j, L, roadSet, riverDown, riverSpine, coords);
    const wji = directedWeight(j, i, L, roadSet, riverDown, riverSpine, coords);
    adj[i]!.push({ to: j, w: wij });
    adj[j]!.push({ to: i, w: wji });
  }

  return adj;
}
