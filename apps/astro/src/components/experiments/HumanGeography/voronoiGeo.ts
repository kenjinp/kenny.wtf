import { Delaunay } from "d3-delaunay";
import type {
  Feature,
  FeatureCollection,
  LineString,
  Point,
  Polygon,
} from "geojson";
import { terrainVoronoiBounds } from "./mapBounds";

export type VoronoiGeo = {
  delaunay: Delaunay<Delaunay.Point>;
  bounds: [number, number, number, number];
  /** Site count (matches Delaunay vertex order). */
  siteCount: number;
  sites: FeatureCollection<Point>;
  cells: FeatureCollection<Polygon>;
  neighborEdges: FeatureCollection<LineString>;
  /** Undirected pairs with `i < j` for `WireTo` dedupe. */
  neighborPairs: [number, number][];
};

function neighborPairsFromDelaunay(d: Delaunay<Delaunay.Point>): [number, number][] {
  const n = d.points.length / 2;
  const seen = new Set<string>();
  const pairs: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    for (const j of d.neighbors(i)) {
      if (j > i) {
        const key = `${i},${j}`;
        if (!seen.has(key)) {
          seen.add(key);
          pairs.push([i, j]);
        }
      }
    }
  }
  return pairs;
}

/**
 * Build Delaunay / Voronoi and GeoJSON-shaped collections for spawn + tooling.
 * Vertex `i` is at `(delaunay.points[2*i], delaunay.points[2*i+1])` in world XZ.
 */
export function buildVoronoiGeo(
  sites: ReadonlyArray<{ x: number; z: number }>,
): VoronoiGeo {
  const bounds = terrainVoronoiBounds();
  const pts = sites.map((s) => [s.x, s.z] as [number, number]);
  const delaunay = Delaunay.from(pts);
  const voronoi = delaunay.voronoi(bounds);
  const coords = delaunay.points;
  const siteCount = coords.length / 2;

  const siteFeatures: Feature<Point>[] = [];
  const cellFeatures: Feature<Polygon>[] = [];
  const edgeFeatures: Feature<LineString>[] = [];

  for (let i = 0; i < siteCount; i++) {
    const x = coords[2 * i]!;
    const z = coords[2 * i + 1]!;
    siteFeatures.push({
      type: "Feature",
      properties: { id: i },
      geometry: {
        type: "Point",
        coordinates: [x, z],
      },
    });

    const poly = voronoi.cellPolygon(i);
    if (poly && poly.length >= 3) {
      const ring = poly.map((p: number[]) => [p[0]!, p[1]!] as [number, number]);
      const first = ring[0]!;
      const last = ring[ring.length - 1]!;
      if (first[0] !== last[0] || first[1] !== last[1]) {
        ring.push([first[0], first[1]]);
      }
      cellFeatures.push({
        type: "Feature",
        properties: { id: i },
        geometry: {
          type: "Polygon",
          coordinates: [ring],
        },
      });
    }
  }

  const pairs = neighborPairsFromDelaunay(delaunay);
  for (const [i, j] of pairs) {
    const ax = coords[2 * i]!;
    const az = coords[2 * i + 1]!;
    const bx = coords[2 * j]!;
    const bz = coords[2 * j + 1]!;
    edgeFeatures.push({
      type: "Feature",
      properties: { a: i, b: j },
      geometry: {
        type: "LineString",
        coordinates: [
          [ax, az],
          [bx, bz],
        ],
      },
    });
  }

  return {
    delaunay,
    bounds,
    siteCount,
    sites: { type: "FeatureCollection", features: siteFeatures },
    cells: { type: "FeatureCollection", features: cellFeatures },
    neighborEdges: { type: "FeatureCollection", features: edgeFeatures },
    neighborPairs: pairs,
  };
}
