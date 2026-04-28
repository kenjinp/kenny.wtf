/** Multipliers applied to geometric edge length L for transport cost. */

export const COST_LAND = 1;
export const COST_ROAD = 0.3;
/** Downstream river: 20× cheaper than road → 0.3/20 */
export const COST_RIVER_DOWNSTREAM = 0.3 / 20;
/** Upstream river: 5× cheaper than road → 0.3/5 */
export const COST_RIVER_UPSTREAM = 0.3 / 5;
/** Crossing river without a road at this edge. */
export const COST_RIVER_CROSSING = 3;

/** Admissible A* heuristic scale: min cost per world unit. */
export const HEURISTIC_MIN_MULT = Math.min(
  COST_LAND,
  COST_ROAD,
  COST_RIVER_DOWNSTREAM,
  COST_RIVER_UPSTREAM,
);

/** Midpoint must be this close to a river segment (world units) to count as crossing. */
export const RIVER_CROSSING_DISTANCE = 24;
