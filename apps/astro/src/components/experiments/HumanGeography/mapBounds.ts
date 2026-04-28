import { TERRAIN_SIZE } from "./terrainConstants";

const HALF = TERRAIN_SIZE / 2;

/** `[xmin, zmin, xmax, zmax]` for `d3-delaunay` Voronoi (second axis = world Z). */
export function terrainVoronoiBounds(): [number, number, number, number] {
  return [-HALF, -HALF, HALF, HALF];
}
