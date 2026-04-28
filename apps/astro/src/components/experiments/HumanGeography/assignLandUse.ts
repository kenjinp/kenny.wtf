import type { Entity, World } from "koota";
import {
  Capital,
  Color,
  EffectiveTransportDist,
  LandUse,
  LandValue,
  Position,
} from "./traits";
import { bestLandUseFromTransport } from "./landUseModel";
import { LAND_USE_PALETTE } from "./landUsePalette";

export function findCapitalSiteIndex(entities: readonly Entity[]): number {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < entities.length; i++) {
    const p = entities[i]!.get(Position)!;
    const d = p.x * p.x + p.y * p.y;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

/** Tag capital and assign land use from crow-flight urban disk + effective transport distance. */
export function assignLandUse(
  _world: World,
  entities: Entity[],
  capitalIndex: number,
  effectiveDist: Float64Array,
): void {
  if (entities.length === 0) return;

  const capital = entities[capitalIndex]!;
  capital.add(Capital());

  const cx = capital.get(Position)!.x;
  const cz = capital.get(Position)!.y;

  for (let i = 0; i < entities.length; i++) {
    const e = entities[i]!;
    const p = e.get(Position)!;
    const dEucl = Math.hypot(p.x - cx, p.y - cz);
    let dEff = effectiveDist[i]!;
    if (!Number.isFinite(dEff)) {
      dEff = dEucl;
    }
    const { kind, rent } = bestLandUseFromTransport(dEucl, dEff);
    const rgb = LAND_USE_PALETTE[kind];
    e.add(LandUse({ kind }));
    e.add(LandValue({ rent }));
    e.add(Color({ r: rgb.r, g: rgb.g, b: rgb.b }));
    e.add(EffectiveTransportDist({ value: dEff }));
  }
}
