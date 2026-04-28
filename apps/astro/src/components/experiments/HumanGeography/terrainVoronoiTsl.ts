/**
 * Legacy GPU Voronoi (O(sites) per pixel). Replaced for performance by
 * `terrainRasterTexture.ts` + `MeshBasicMaterial` in `Terrain.tsx`. Kept for
 * reference or future experiments.
 */
import type { Entity } from "koota";
import * as THREE from "three/webgpu";
import {
  float,
  floor,
  Fn,
  fwidth,
  If,
  int,
  ivec2,
  lengthSq,
  Loop,
  max,
  mix,
  positionWorld,
  select,
  smoothstep,
  sqrt,
  texture as tslTexture,
  textureLoad,
  uniform,
  vec3,
  vec4,
} from "three/tsl";
import { MAX_SITES, SITE_TEX_HEIGHT, SITE_TEX_WIDTH } from "./mapConstants";
import { Color, Position, SiteIndex } from "./traits";

const BG = vec4(0.102, 0.102, 0.141, 1);
const INF = 1e20;
/** Approximate cell-edge thickness in screen pixels (independent of view angle). */
const VORO_EDGE_PX = float(1.5);
/** Lower bound on `fwidth(gap)` so the smoothstep never collapses to 0/0. */
const VORO_FW_MIN = float(1e-4);

/** Stable string from sites; lets us skip GPU uploads when nothing relevant changed. */
function gpuUploadKey(sorted: Entity[]): string {
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

export type TerrainVoronoiTslBundle = {
  material: THREE.MeshBasicNodeMaterial;
  update: (sorted: Entity[]) => void;
  dispose: () => void;
};

/**
 * Voronoi-fill terrain shader. The fragment scans every site and returns the
 * closest site's color. Simple O(N) per pixel; fine while `MAX_SITES` stays small
 * into a 2D atlas (see `SITE_TEX_WIDTH` / `SITE_TEX_HEIGHT`) so dimensions stay
 * within typical WebGPU `maxTextureDimension2D` (8192). If perf becomes an issue,
 * replace the loop with a seed-grid + neighbor-texture lookup.
 */
export function createTerrainVoronoiTslMaterial(): TerrainVoronoiTslBundle {
  let lastUploadKey: string | null = null;

  const atlasTexels = SITE_TEX_WIDTH * SITE_TEX_HEIGHT;
  const posData = new Float32Array(atlasTexels * 4);
  const colorData = new Float32Array(atlasTexels * 4);

  const posTex = new THREE.DataTexture(
    posData,
    SITE_TEX_WIDTH,
    SITE_TEX_HEIGHT,
    THREE.RGBAFormat,
    THREE.FloatType,
  );
  posTex.magFilter = THREE.NearestFilter;
  posTex.minFilter = THREE.NearestFilter;
  posTex.generateMipmaps = false;
  posTex.unpackAlignment = 1;
  posTex.needsUpdate = true;

  const colorTex = new THREE.DataTexture(
    colorData,
    SITE_TEX_WIDTH,
    SITE_TEX_HEIGHT,
    THREE.RGBAFormat,
    THREE.FloatType,
  );
  colorTex.magFilter = THREE.NearestFilter;
  colorTex.minFilter = THREE.NearestFilter;
  colorTex.generateMipmaps = false;
  colorTex.unpackAlignment = 1;
  colorTex.needsUpdate = true;

  const posTexNode = tslTexture(posTex);
  const colTexNode = tslTexture(colorTex);
  const uSiteCount = uniform(0);
  const uTexWidth = uniform(SITE_TEX_WIDTH);
  const uBorderRgb = uniform(new THREE.Vector3(0.05, 0.05, 0.08));

  const atlasCoord = (linearIdx: unknown) => {
    const fi = float(linearIdx as never);
    const w = float(uTexWidth);
    const ty = int(floor(fi.div(w)));
    const tx = int(fi.sub(float(ty).mul(w)));
    return ivec2(tx, ty);
  };

  const mat = new THREE.MeshBasicNodeMaterial({ toneMapped: false });

  /**
   * Voronoi fill + cell edges. Tracks the closest (`idx1`) and second-closest
   * (`idx2`) sites. The cell edge between them is the perpendicular bisector of
   * `S1` and `S2`. The perpendicular distance from P to that bisector is
   *
   *     dist = (||P-S2||² - ||P-S1||²) / (2 * ||S2-S1||)
   *          = (best2 - best1) / (2 * sep)
   *
   * `dist` has a constant unit gradient where the (S1,S2) labels are stable,
   * so `fwidth(dist)` is a clean per-screen-pixel measure — no aliasing from
   * the gradient kinks that `gap = e2 - e1` had, and no growth with view tilt.
   */
  const voronoiFill = Fn(() => {
    const best1 = float(INF).toVar("best1");
    const best2 = float(INF).toVar("best2");
    const idx1 = int(0).toVar("idx1");
    const idx2 = int(0).toVar("idx2");
    const rgb = vec3(0, 0, 0).toVar("rgb");
    const iEnd = int(floor(uSiteCount.add(0.5)));
    Loop({ start: int(0), end: iEnd, type: "int", condition: "<" }, ({ i }) => {
      const uv = atlasCoord(i);
      const p = textureLoad(posTexNode, uv).xy;
      const c = textureLoad(colTexNode, uv).xyz;
      const d2 = lengthSq(positionWorld.xz.sub(p));
      If(d2.lessThan(best1), () => {
        best2.assign(best1);
        idx2.assign(idx1);
        best1.assign(d2);
        idx1.assign(i);
        rgb.assign(c);
      }).Else(() => {
        If(d2.lessThan(best2), () => {
          best2.assign(d2);
          idx2.assign(i);
        });
      });
    });

    const s1 = textureLoad(posTexNode, atlasCoord(idx1)).xy;
    const s2 = textureLoad(posTexNode, atlasCoord(idx2)).xy;
    const sep = max(sqrt(lengthSq(s2.sub(s1))), float(1e-6));
    const dist = max(float(0), best2.sub(best1).div(sep.mul(float(2))));
    const lineW = max(VORO_FW_MIN, fwidth(dist)).mul(VORO_EDGE_PX);
    const lineA = float(1).sub(smoothstep(float(0), lineW, dist));
    return vec4(mix(rgb, uBorderRgb, lineA), 1);
  });

  mat.colorNode = Fn(() =>
    select(uSiteCount.lessThan(float(3)), BG, voronoiFill()),
  )();

  const update = (sorted: Entity[]) => {
    const nextKey = gpuUploadKey(sorted);
    if (nextKey === lastUploadKey) return;
    lastUploadKey = nextKey;

    const n = sorted.length;
    uSiteCount.value = n;

    posData.fill(0);
    colorData.fill(0);

    if (n >= 3) {
      for (let i = 0; i < n; i++) {
        const e = sorted[i]!;
        const p = e.get(Position)!;
        const c = e.get(Color)!;
        const o = i * 4;
        posData[o] = p.x;
        posData[o + 1] = p.y;
        posData[o + 2] = 0;
        posData[o + 3] = 1;
        colorData[o] = c.r;
        colorData[o + 1] = c.g;
        colorData[o + 2] = c.b;
        colorData[o + 3] = 1;
      }
    }

    posTex.needsUpdate = true;
    colorTex.needsUpdate = true;
    mat.needsUpdate = true;
  };

  const dispose = () => {
    posTex.dispose();
    colorTex.dispose();
    mat.dispose();
  };

  return { material: mat, update, dispose };
}

export function compareSiteIndexForTerrain(a: Entity, b: Entity) {
  return a.get(SiteIndex)!.index - b.get(SiteIndex)!.index;
}
