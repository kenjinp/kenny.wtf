/** Upper bound on site entities (instancing, edge buffers, terrain shader loop). */
export const MAX_SITES = 10_000;

/**
 * 2D atlas for site positions/colors in the terrain shader. WebGPU commonly limits
 * 2D texture width/height to 8192; a 10000×1 1D texture exceeds that, so we pack
 * into a 100×100 atlas (10_000 texels).
 */
export const SITE_TEX_WIDTH = 100;
export const SITE_TEX_HEIGHT = 100;

if (MAX_SITES > SITE_TEX_WIDTH * SITE_TEX_HEIGHT) {
  throw new Error(
    "MAX_SITES exceeds SITE_TEX_WIDTH * SITE_TEX_HEIGHT; bump atlas size.",
  );
}
