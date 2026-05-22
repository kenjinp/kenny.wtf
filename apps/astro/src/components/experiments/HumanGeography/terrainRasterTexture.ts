import type { Delaunay } from "d3-delaunay";
import type { Entity } from "koota";
import * as THREE from "three/webgpu";
import { Color, Position } from "./traits";
import { TERRAIN_RASTER_RES, TERRAIN_SIZE } from "./terrainConstants";

/** Matches former Voronoi edge tint in `terrainVoronoiTsl.ts`. */
const BORDER_RGB = { r: 0.05, g: 0.05, b: 0.08 };
const BORDER_MIX = 0.45;

/** Stable key when site positions/colors change (re-raster). */
export function terrainRasterUploadKey(sorted: Entity[]): string {
  const n = sorted.length;
  if (n < 3) return `s:${n}`;
  const parts: string[] = [`s:${n}`];
  for (let i = 0; i < n; i++) {
    const e = sorted[i]!;
    const p = e.get(Position)!;
    const c = e.get(Color)!;
    parts.push(
      `${p.x.toFixed(4)}:${p.y.toFixed(4)}:${c.r.toFixed(4)}:${c.g.toFixed(4)}:${c.b.toFixed(4)}`,
    );
  }
  return parts.join(";");
}

/**
 * Bake Voronoi cell colors into a 2D texture (one `delaunay.find` per texel).
 * Far cheaper than O(sites) per fragment in the GPU shader at fullscreen.
 */
export function buildTerrainLandUseDataTexture(
  sorted: Entity[],
  delaunay: Delaunay<number[]>,
): THREE.DataTexture {
  const W = TERRAIN_RASTER_RES;
  const H = TERRAIN_RASTER_RES;
  const half = TERRAIN_SIZE / 2;

  const rgba = new Uint8Array(W * H * 4);
  const siteId = new Int32Array(W * H);
  siteId.fill(-1);

  let hint = 0;
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const wx = ((i + 0.5) / W) * TERRAIN_SIZE - half;
      const wz = ((j + 0.5) / H) * TERRAIN_SIZE - half;
      const idx = delaunay.find(wx, wz, hint);
      hint = idx;

      const e = sorted[idx]!;
      const c = e.get(Color)!;
      const k = j * W + i;
      const o = k * 4;
      rgba[o] = Math.min(255, Math.round(c.r * 255));
      rgba[o + 1] = Math.min(255, Math.round(c.g * 255));
      rgba[o + 2] = Math.min(255, Math.round(c.b * 255));
      rgba[o + 3] = 255;
      siteId[k] = idx;
    }
  }

  const br = Math.round(BORDER_RGB.r * 255);
  const bg = Math.round(BORDER_RGB.g * 255);
  const bb = Math.round(BORDER_RGB.b * 255);

  const out = new Uint8Array(rgba.length);
  out.set(rgba);
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const k = j * W + i;
      const id = siteId[k]!;
      let edge = false;
      if (i > 0 && siteId[k - 1] !== id) edge = true;
      if (i < W - 1 && siteId[k + 1] !== id) edge = true;
      if (j > 0 && siteId[k - W] !== id) edge = true;
      if (j < H - 1 && siteId[k + W] !== id) edge = true;
      if (!edge) continue;
      const o = k * 4;
      out[o] = Math.round(rgba[o]! * (1 - BORDER_MIX) + br * BORDER_MIX);
      out[o + 1] = Math.round(
        rgba[o + 1]! * (1 - BORDER_MIX) + bg * BORDER_MIX,
      );
      out[o + 2] = Math.round(
        rgba[o + 2]! * (1 - BORDER_MIX) + bb * BORDER_MIX,
      );
    }
  }

  const tex = new THREE.DataTexture(
    out,
    W,
    H,
    THREE.RGBAFormat,
    THREE.UnsignedByteType,
  );
  // Palette values are already linear; marking the texture sRGB double-darkens it.
  tex.colorSpace = THREE.LinearSRGBColorSpace;
  tex.flipY = false;
  tex.needsUpdate = true;
  tex.generateMipmaps = false;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.unpackAlignment = 1;

  return tex;
}
