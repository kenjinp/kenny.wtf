/** World extent (XZ) for the ground plane and Voronoi bounds. */
export const TERRAIN_SIZE = 2048;

/** Flat shader terrain: keep at 1 until vertex displacement is needed (high segments = many extra verts, no fill benefit). */
export const TERRAIN_SEGMENTS = 1;

/** CPU-rasterized land-use texture resolution (one texel samples nearest Voronoi cell once at init). */
export const TERRAIN_RASTER_RES = 1024;
