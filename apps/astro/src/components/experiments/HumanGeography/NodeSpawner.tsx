import { useLayoutEffect } from "react";
import { useWorld } from "koota/react";
import { spawnVoronoiMap } from "./spawnVoronoiMap";

/** Spawns Voronoi site graph once; resets world on unmount. */
export default function NodeSpawner() {
  const w = useWorld();

  // useLayoutEffect so graph exists before sibling renderers read ECS.
  useLayoutEffect(() => {
    spawnVoronoiMap(w);
    return () => w.reset();
  }, [w]);

  return null;
}
