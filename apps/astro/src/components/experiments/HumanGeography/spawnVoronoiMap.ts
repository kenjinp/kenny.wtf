import type { Entity, World } from "koota";
import { assignLandUse, findCapitalSiteIndex } from "./assignLandUse";
import { buildDirectedAdjacency } from "./costGraph";
import { dijkstraFromSource } from "./dijkstraCity";
import { buildRoadRiverInfrastructure } from "./infrastructure";
import { setInfrastructureSpines } from "./infrastructureState";
import { WireTo } from "./relations";
import { Position, SiteIndex } from "./traits";
import { generateBlueNoiseSites } from "./blueNoiseSites";
import { buildVoronoiGeo } from "./voronoiGeo";

/** Blue-noise sites + Delaunay neighbors + road/river + cost-weighted land use. */
export function spawnVoronoiMap(world: World): void {
  const raw = generateBlueNoiseSites();
  const geo = buildVoronoiGeo(raw);
  const coords = geo.delaunay.points;
  const n = geo.siteCount;
  const entities: Entity[] = [];

  for (let i = 0; i < n; i++) {
    const x = coords[2 * i]!;
    const z = coords[2 * i + 1]!;
    const e = world.spawn(SiteIndex({ index: i }), Position({ x, y: z }));
    entities.push(e);
  }

  for (const [i, j] of geo.neighborPairs) {
    const a = entities[i]!;
    const b = entities[j]!;
    a.add(WireTo(b));
    b.add(WireTo(a));
  }

  const capIdx = findCapitalSiteIndex(entities);
  const { roadSpine, riverSpine } = buildRoadRiverInfrastructure(
    entities,
    geo.delaunay,
    capIdx,
  );
  setInfrastructureSpines(roadSpine, riverSpine);

  const adj = buildDirectedAdjacency(
    n,
    geo.neighborPairs,
    coords,
    roadSpine,
    riverSpine,
  );
  const dist = dijkstraFromSource(adj, capIdx);

  assignLandUse(world, entities, capIdx, dist);
}
