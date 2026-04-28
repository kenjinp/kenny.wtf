import { density01 } from "./densityField";
import { terrainVoronoiBounds } from "./mapBounds";
import { MAX_SITES } from "./mapConstants";

export type SiteXZ = { x: number; z: number };

/** Min / max Poisson separation in world units (high density → smaller radius). */
const R_MIN = 14;
const R_MAX = 42;

const BRIDSON_K = 30;
const SEED = 0x502a8ce1;

function rng(): number {
  return Math.sin(SEED * 0.0001 + Math.random() * 99999) * 0.5 + 0.5;
}

function rAt(x: number, z: number): number {
  const d = density01(x, z);
  return R_MIN + (R_MAX - R_MIN) * d;
}

function distSq(ax: number, az: number, bx: number, bz: number): number {
  const dx = ax - bx;
  const dz = az - bz;
  return dx * dx + dz * dz;
}

function cellKey(ix: number, iz: number): string {
  return `${ix},${iz}`;
}

/**
 * Variable-density Poisson-disk (Bridson-style) sample in terrain XZ.
 * Neighbor clearance uses `0.5 * (r(p) + r(q))` (symmetric).
 */
export function generateBlueNoiseSites(): SiteXZ[] {
  const [xmin, zmin, xmax, zmax] = terrainVoronoiBounds();
  const margin = R_MAX;
  const innerX0 = xmin + margin;
  const innerX1 = xmax - margin;
  const innerZ0 = zmin + margin;
  const innerZ1 = zmax - margin;
  if (innerX1 <= innerX0 || innerZ1 <= innerZ0) {
    return [{ x: 0, z: 0 }];
  }

  const cellSize = R_MIN / Math.sqrt(2);
  const searchR = 2 * R_MAX;
  const cellSpan = Math.max(2, Math.ceil(searchR / cellSize) + 1);

  const sites: SiteXZ[] = [];
  const grid = new Map<string, number[]>();
  const active: number[] = [];

  const addSite = (x: number, z: number) => {
    const i = sites.length;
    sites.push({ x, z });
    const ix = Math.floor(x / cellSize);
    const iz = Math.floor(z / cellSize);
    const k = cellKey(ix, iz);
    let arr = grid.get(k);
    if (!arr) {
      arr = [];
      grid.set(k, arr);
    }
    arr.push(i);
    active.push(i);
  };

  const ok = (x: number, z: number, rSelf: number): boolean => {
    const ix = Math.floor(x / cellSize);
    const iz = Math.floor(z / cellSize);
    for (let di = -cellSpan; di <= cellSpan; di++) {
      for (let dj = -cellSpan; dj <= cellSpan; dj++) {
        const list = grid.get(cellKey(ix + di, iz + dj));
        if (!list) continue;
        for (const j of list) {
          const p = sites[j]!;
          const rq = rAt(p.x, p.z);
          const need = 0.5 * (rSelf + rq) * 0.998;
          const need2 = need * need;
          if (distSq(x, z, p.x, p.z) < need2) return false;
        }
      }
    }
    return true;
  };

  addSite((innerX0 + innerX1) / 2, (innerZ0 + innerZ1) / 2);

  while (active.length > 0 && sites.length < MAX_SITES) {
    const ai = Math.floor(rng() * active.length);
    const pi = active[ai]!;
    const px = sites[pi]!.x;
    const pz = sites[pi]!.z;
    const rP = rAt(px, pz);
    let found = false;
    for (let k = 0; k < BRIDSON_K; k++) {
      const ang = rng() * Math.PI * 2;
      const rad = rP + rng() * rP;
      const x = px + Math.cos(ang) * rad;
      const z = pz + Math.sin(ang) * rad;
      if (x < innerX0 || x > innerX1 || z < innerZ0 || z > innerZ1) continue;
      const rS = rAt(x, z);
      if (ok(x, z, rS)) {
        addSite(x, z);
        found = true;
        break;
      }
    }
    if (!found) {
      active.splice(ai, 1);
    }
  }

  return sites;
}
