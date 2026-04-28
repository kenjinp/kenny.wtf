import { trait } from "koota";

/** World XZ on the ground plane (terrain is rotated −π/2 around X). */
export const Position = trait({ x: 0, y: 0 });

/** Linear RGB in 0–1 for instanced per-instance color and terrain fill. */
export const Color = trait({ r: 0, g: 0, b: 0 });

/** Stable index `0..n-1` matching Delaunay / Voronoi vertex order at spawn. */
export const SiteIndex = trait({ index: 0 });

/** The Voronoi site chosen as the central market (single entity). */
export const Capital = trait();

/** `LandUseKind` id from landUseModel. */
export const LandUse = trait({ kind: 0 });

/** Net land rent for the assigned use at this site. */
export const LandValue = trait({ rent: 0 });

/** Site lies on the generated road spine (visual tag). */
export const RoadSegment = trait();

/** Site lies on the generated river spine (visual tag). */
export const RiverSegment = trait();

/** Shortest-path transport cost from the capital on the weighted graph (same units as edge lengths × multipliers). */
export const EffectiveTransportDist = trait({ value: 0 });
