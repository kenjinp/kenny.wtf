import { TERRAIN_SIZE } from "./terrainConstants";

const HALF = TERRAIN_SIZE / 2;

function hash01(ix: number, iy: number, seed: number): number {
  const x = Math.sin(ix * 127.1 + iy * 311.7 + seed * 0.002) * 43758.5453123;
  return x - Math.floor(x);
}

function smoothstep(t: number): number {
  const u = Math.min(1, Math.max(0, t));
  return u * u * (3 - 2 * u);
}

function valueNoise01(x: number, y: number, seed: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const sx = x - x0;
  const sy = y - y0;
  const n00 = hash01(x0, y0, seed);
  const n10 = hash01(x0 + 1, y0, seed);
  const n01 = hash01(x0, y0 + 1, seed);
  const n11 = hash01(x0 + 1, y0 + 1, seed);
  const ux = smoothstep(sx);
  const uy = smoothstep(sy);
  const a = n00 + (n10 - n00) * ux;
  const b = n01 + (n11 - n01) * ux;
  return a + (b - a) * uy;
}

const DENSITY_SEED = 0x6a09e667;

/**
 * Smooth scalar in `[0, 1]` over world XZ (used for Poisson radius lerp).
 * Normalized coords so the field scales with `TERRAIN_SIZE`.
 */
export function density01(x: number, z: number): number {
  const nx = (x + HALF) / TERRAIN_SIZE;
  const nz = (z + HALF) / TERRAIN_SIZE;
  const scale = 4;
  const a = valueNoise01(nx * scale * 32, nz * scale * 32, DENSITY_SEED);
  const b = valueNoise01(
    nx * scale * 64 + 2.2,
    nz * scale * 64 + 1.7,
    DENSITY_SEED ^ 0xdeadbeef,
  );
  const m = 0.6 * a + 0.4 * b;
  return Math.min(1, Math.max(0, m));
}
