import type { LandUseKindId } from "./landUseModel";
import { LandUseKind } from "./landUseModel";

/** Linear RGB 0–1 for terrain / legend swatches. */
export type LandUseRgb = { r: number; g: number; b: number };

export const LAND_USE_PALETTE: Record<LandUseKindId, LandUseRgb> = {
  [LandUseKind.UrbanResidential]: { r: 0.55, g: 0.52, b: 0.48 },
  [LandUseKind.Horticulture]: { r: 0.25, g: 0.72, b: 0.38 },
  [LandUseKind.Silviculture]: { r: 0.22, g: 0.45, b: 0.28 },
  [LandUseKind.Grain]: { r: 0.85, g: 0.75, b: 0.35 },
  [LandUseKind.Pasture]: { r: 0.42, g: 0.62, b: 0.35 },
  [LandUseKind.Wilderness]: { r: 0.12, g: 0.14, b: 0.18 },
};

export function rgbCss(rgb: LandUseRgb): string {
  const r = Math.round(rgb.r * 255);
  const g = Math.round(rgb.g * 255);
  const b = Math.round(rgb.b * 255);
  return `rgb(${r},${g},${b})`;
}

export const LEGEND_ORDER: LandUseKindId[] = [
  LandUseKind.UrbanResidential,
  LandUseKind.Horticulture,
  LandUseKind.Silviculture,
  LandUseKind.Grain,
  LandUseKind.Pasture,
  LandUseKind.Wilderness,
];
