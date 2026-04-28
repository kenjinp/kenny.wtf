/**
 * Von Thünen-style rent at distance d from the market (city):
 *   R_k(d) = a_k − b_k · d
 * where a_k bundles yield × (price − local cost) and b_k is transport intensity per unit distance.
 * Urban residential is a fixed inner zone (no crop competition).
 */

/** Matches `LandUse.kind` storage and palette order. */
export const LandUseKind = {
  UrbanResidential: 0,
  Horticulture: 1,
  Silviculture: 2,
  Grain: 3,
  Pasture: 4,
  Wilderness: 5,
} as const;

export type LandUseKindId = (typeof LandUseKind)[keyof typeof LandUseKind];

/** World units; inside this radius from the city, land is urban. */
export const URBAN_INNER_RADIUS = 40;

/** 1 world unit ≈ this many metres (for travel time labels). */
export const WORLD_UNITS_PER_METRE = 0.1;

/** Walking speed for “travel time” hint (km/h). */
export const ASSUMED_TRAVEL_SPEED_KMH = 5;

export type CropParams = {
  kind: LandUseKindId;
  /** Rent intercept a_k at d = 0 (same units as rent output). */
  a: number;
  /** Transport slope b_k: cost added per unit distance. */
  b: number;
};

/** Crop rings only; urban and wilderness handled separately. */
export const CROP_PARAMS: readonly CropParams[] = [
  { kind: LandUseKind.Horticulture, a: 200, b: 1.6 },
  { kind: LandUseKind.Silviculture, a: 140, b: 0.55 },
  { kind: LandUseKind.Grain, a: 95, b: 0.18 },
  { kind: LandUseKind.Pasture, a: 50, b: 0.05 },
];

export type LandUseResult = {
  kind: LandUseKindId;
  rent: number;
};

export function rentForCrop(p: CropParams, d: number): number {
  return p.a - p.b * d;
}

export function bestLandUse(d: number): LandUseResult {
  return bestLandUseFromTransport(d, d);
}

/** Urban disk uses crow-flight distance; crops use effective transport cost distance from the city. */
export function bestLandUseFromTransport(
  euclideanFromCity: number,
  effectiveTransport: number,
): LandUseResult {
  if (euclideanFromCity <= URBAN_INNER_RADIUS) {
    return { kind: LandUseKind.UrbanResidential, rent: 1 };
  }

  const d = effectiveTransport;

  let bestKind: LandUseKindId = LandUseKind.Wilderness;
  let bestRent = -Infinity;

  for (const c of CROP_PARAMS) {
    const r = rentForCrop(c, d);
    if (r > bestRent) {
      bestRent = r;
      bestKind = c.kind;
    }
  }

  if (bestRent <= 0) {
    return { kind: LandUseKind.Wilderness, rent: bestRent };
  }

  return { kind: bestKind, rent: bestRent };
}

export type RentLine = {
  kind: LandUseKindId;
  label: string;
  a: number;
  b: number;
  transportCost: number;
  rent: number;
  rowType: "urban" | "crop";
};

const KIND_LABEL: Record<LandUseKindId, string> = {
  [LandUseKind.UrbanResidential]: "Urban residential",
  [LandUseKind.Horticulture]: "Horticulture",
  [LandUseKind.Silviculture]: "Silviculture / arboriculture",
  [LandUseKind.Grain]: "Wheat / grain",
  [LandUseKind.Pasture]: "Pasturage / transhumance",
  [LandUseKind.Wilderness]: "Wilderness (non‑cultivated)",
};

/** Full cost breakdown at distance d for tooltips and legend copy. */
export function rentBreakdownAtDistance(d: number): {
  distance: number;
  travelHours: number;
  lines: RentLine[];
  winner: LandUseResult;
} {
  return rentBreakdownForCell(d, d);
}

/** Tooltip: crow-flight `euclideanD` for urban zone; `effectiveD` for crop transport rent. */
export function rentBreakdownForCell(
  euclideanD: number,
  effectiveD: number,
): {
  distance: number;
  effectiveTransport: number;
  travelHours: number;
  effectiveTravelHours: number;
  lines: RentLine[];
  winner: LandUseResult;
} {
  const winner = bestLandUseFromTransport(euclideanD, effectiveD);
  const distM = euclideanD / WORLD_UNITS_PER_METRE;
  const travelHours = distM / 1000 / ASSUMED_TRAVEL_SPEED_KMH;
  const effM = effectiveD / WORLD_UNITS_PER_METRE;
  const effectiveTravelHours = effM / 1000 / ASSUMED_TRAVEL_SPEED_KMH;

  const lines: RentLine[] = [];

  lines.push({
    kind: LandUseKind.UrbanResidential,
    label: KIND_LABEL[LandUseKind.UrbanResidential],
    a: 0,
    b: 0,
    transportCost: 0,
    rent: euclideanD <= URBAN_INNER_RADIUS ? 1 : 0,
    rowType: "urban",
  });

  for (const c of CROP_PARAMS) {
    const transportCost = c.b * effectiveD;
    const rent = rentForCrop(c, effectiveD);
    lines.push({
      kind: c.kind,
      label: KIND_LABEL[c.kind],
      a: c.a,
      b: c.b,
      transportCost,
      rent,
      rowType: "crop",
    });
  }

  return {
    distance: euclideanD,
    effectiveTransport: effectiveD,
    travelHours,
    effectiveTravelHours,
    lines,
    winner,
  };
}

export function landUseLabel(kind: LandUseKindId): string {
  return KIND_LABEL[kind];
}
