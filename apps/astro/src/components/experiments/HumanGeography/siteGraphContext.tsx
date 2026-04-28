import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { Delaunay } from "d3-delaunay";
import type { Entity } from "koota";
import { useQuery } from "koota/react";
import {
  Color,
  EffectiveTransportDist,
  LandUse,
  LandValue,
  Position,
  SiteIndex,
} from "./traits";

function compareSiteIndex(a: Entity, b: Entity) {
  return a.get(SiteIndex)!.index - b.get(SiteIndex)!.index;
}

export type SiteGraphValue = {
  /** Sites sorted by `SiteIndex` (stable order for instance ids, GPU textures, etc.). */
  sorted: Entity[];
  /** `null` if fewer than three sites. */
  delaunay: Delaunay<number[]> | null;
  siteCount: number;
};

const SiteGraphContext = createContext<SiteGraphValue | null>(null);

function positionsKey(entities: Entity[]) {
  if (entities.length < 3) return "";
  return entities
    .map((e) => {
      const p = e.get(Position);
      if (!p) return "";
      return `${p.x.toFixed(4)}:${p.y.toFixed(4)}`;
    })
    .join(";");
}

export function SiteGraphProvider({ children }: { children: ReactNode }) {
  const entities = useQuery(
    Position,
    Color,
    SiteIndex,
    LandUse,
    LandValue,
    EffectiveTransportDist,
  );

  const sorted = useMemo(
    () => [...entities].sort(compareSiteIndex),
    // koota may reuse the same `entities` array ref while appending — length must be a dep
    [entities, entities.length],
  );

  const key = useMemo(() => positionsKey(sorted), [sorted]);

  const delaunay = useMemo(() => {
    if (sorted.length < 3) return null;
    const pts = sorted.map(
      (e) => [e.get(Position)!.x, e.get(Position)!.y] as [number, number],
    );
    return Delaunay.from(pts);
  }, [key, sorted.length]);

  const value = useMemo<SiteGraphValue>(
    () => ({ sorted, delaunay, siteCount: sorted.length }),
    [sorted, delaunay],
  );

  return (
    <SiteGraphContext.Provider value={value}>
      {children}
    </SiteGraphContext.Provider>
  );
}

export function useSiteGraph(): SiteGraphValue {
  const v = useContext(SiteGraphContext);
  if (!v) {
    throw new Error("useSiteGraph must be used within SiteGraphProvider");
  }
  return v;
}
