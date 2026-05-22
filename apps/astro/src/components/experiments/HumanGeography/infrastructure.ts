import type { Delaunay } from "d3-delaunay";
import type { Entity } from "koota";
import { astarWeighted } from "./astarWeightedGraph";
import { Road, RiverDownstream, WireTo } from "./relations";
import { Position, RoadSegment, RiverSegment, SiteIndex } from "./traits";
import { HEURISTIC_MIN_MULT } from "./transportConstants";
import { TERRAIN_SIZE } from "./terrainConstants";

export type EdgeSide = "N" | "E" | "S" | "W";

/** River: upstream side → downstream side (perpendicular to road by default). */
export const RIVER_AXIS: [EdgeSide, EdgeSide] = ["N", "S"];

/** Road: one edge → opposite edge. */
export const ROAD_AXIS: [EdgeSide, EdgeSide] = ["W", "E"];

/** Seed for edge endpoints + river meander noise (change for a new layout). */
export const INFRASTRUCTURE_SEED = 0x7f4a7c13;

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashBiasU32(i: number, j: number, salt: number): number {
  let h = (Math.imul(i, 0x9e3779b1) ^ Math.imul(j, 0x85ebca6b) ^ salt) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 2246822507) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0;
  return h ^ (h >>> 16);
}

/** Random point on map boundary `side` (XZ world; margin inset from corners). */
export function randomEdgePoint(
  side: EdgeSide,
  rng: () => number,
): [number, number] {
  const half = TERRAIN_SIZE / 2;
  const margin = TERRAIN_SIZE * 0.06;
  const span = TERRAIN_SIZE - 2 * margin;
  const t = margin + rng() * span;
  switch (side) {
    case "N":
      return [-half + t, half];
    case "S":
      return [-half + t, -half];
    case "E":
      return [half, -half + t];
    case "W":
      return [-half, -half + t];
  }
}

export function nearestSiteIndex(
  delaunay: Delaunay<number[]>,
  x: number,
  z: number,
): number {
  return delaunay.find(x, z);
}

function edgeLength(a: Entity, b: Entity): number {
  const pa = a.get(Position)!;
  const pb = b.get(Position)!;
  return Math.hypot(pa.x - pb.x, pa.y - pb.y);
}

function heuristicToGoal(goal: Entity): (e: Entity) => number {
  const pg = goal.get(Position)!;
  return (e: Entity) => {
    const p = e.get(Position)!;
    return Math.hypot(p.x - pg.x, p.y - pg.y) * HEURISTIC_MIN_MULT;
  };
}

function joinPaths(a: Entity[], b: Entity[]): Entity[] {
  if (a.length === 0) return b;
  if (b.length === 0) return a;
  return [...a, ...b.slice(1)];
}

function entityPathToIndices(path: Entity[] | null): number[] {
  if (!path) return [];
  return path.map((e) => e.get(SiteIndex)!.index);
}

/**
 * Tags `RoadSegment` / `RiverSegment`, adds `Road` and `RiverDownstream` relations.
 * Returns ordered site indices along each spine for the cost graph.
 */
export function buildRoadRiverInfrastructure(
  entities: Entity[],
  delaunay: Delaunay<number[]>,
  capitalIndex: number,
  seed = INFRASTRUCTURE_SEED,
): { roadSpine: number[]; riverSpine: number[] } {
  const rng = mulberry32(seed);

  const roadEntry = nearestSiteIndex(
    delaunay,
    ...randomEdgePoint(ROAD_AXIS[0], rng),
  );
  const roadExit = nearestSiteIndex(
    delaunay,
    ...randomEdgePoint(ROAD_AXIS[1], rng),
  );
  const riverEntry = nearestSiteIndex(
    delaunay,
    ...randomEdgePoint(RIVER_AXIS[0], rng),
  );
  const riverExit = nearestSiteIndex(
    delaunay,
    ...randomEdgePoint(RIVER_AXIS[1], rng),
  );

  const capital = entities[capitalIndex]!;
  const roadA = entities[roadEntry]!;
  const roadB = entities[roadExit]!;
  const rivA = entities[riverEntry]!;
  const rivB = entities[riverExit]!;

  const neighbors = (e: Entity) =>
    e.targetsFor(WireTo).filter((t) => t.isAlive());

  const roadHalf1 = astarWeighted(
    roadA,
    capital,
    neighbors,
    edgeLength,
    heuristicToGoal(capital),
  );
  const roadHalf2 = astarWeighted(
    capital,
    roadB,
    neighbors,
    edgeLength,
    heuristicToGoal(roadB),
  );
  const roadPath = joinPaths(roadHalf1 ?? [], roadHalf2 ?? []);

  const riverBiasCost = (salt: number) => (from: Entity, to: Entity) => {
    const base = edgeLength(from, to);
    const i = from.get(SiteIndex)!.index;
    const j = to.get(SiteIndex)!.index;
    const u = hashBiasU32(i, j, salt) / 4294967296;
    const bias = 1 + u * 0.55;
    return base * bias;
  };

  const riverHalf1 = astarWeighted(
    rivA,
    capital,
    neighbors,
    riverBiasCost(seed ^ 0x11111111),
    heuristicToGoal(capital),
  );
  const riverHalf2 = astarWeighted(
    capital,
    rivB,
    neighbors,
    riverBiasCost(seed ^ 0x22222222),
    heuristicToGoal(rivB),
  );
  const riverPath = joinPaths(riverHalf1 ?? [], riverHalf2 ?? []);

  for (const e of roadPath) {
    if (e.isAlive()) e.add(RoadSegment());
  }
  for (let k = 0; k < roadPath.length - 1; k++) {
    const u = roadPath[k]!;
    const v = roadPath[k + 1]!;
    if (!u.isAlive() || !v.isAlive()) continue;
    u.add(Road(v));
    v.add(Road(u));
  }

  for (const e of riverPath) {
    if (e.isAlive()) e.add(RiverSegment());
  }
  for (let k = 0; k < riverPath.length - 1; k++) {
    const u = riverPath[k]!;
    const v = riverPath[k + 1]!;
    if (!u.isAlive() || !v.isAlive()) continue;
    u.add(RiverDownstream(v));
  }

  return {
    roadSpine: entityPathToIndices(roadPath),
    riverSpine: entityPathToIndices(riverPath),
  };
}
