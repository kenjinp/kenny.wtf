import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Entity } from "koota";
import { astarGraph } from "./astarGraph";
import { WireTo } from "./relations";
import { Position } from "./traits";

export type PickPhase = "pickSource" | "pickSink" | "done";

/** Picked leaf: Koota entity id + world XZ (`Position`: x, y = Z). */
export type NodePickInfo = { entityId: number; x: number; y: number };

type PathPickValue = {
  phase: PickPhase;
  bKeyDown: boolean;
  sourceEntity: Entity | null;
  sinkEntity: Entity | null;
  pathEntities: Entity[] | null;
  sourceInfo: NodePickInfo | null;
  sinkInfo: NodePickInfo | null;
  onPathNodePicked: (entity: Entity) => void;
};

const PathPickContext = createContext<PathPickValue | null>(null);

function infoFromEntity(e: Entity): NodePickInfo {
  const p = e.get(Position)!;
  return { entityId: e.id(), x: p.x, y: p.y };
}

export function PathPickProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<PickPhase>("pickSource");
  const [bKeyDown, setBKeyDown] = useState(false);
  const [sourceEntity, setSourceEntity] = useState<Entity | null>(null);
  const [sinkEntity, setSinkEntity] = useState<Entity | null>(null);
  const [pathEntities, setPathEntities] = useState<Entity[] | null>(null);
  const [sourceInfo, setSourceInfo] = useState<NodePickInfo | null>(null);
  const [sinkInfo, setSinkInfo] = useState<NodePickInfo | null>(null);
  const sourceRef = useRef<Entity | null>(null);

  useEffect(() => {
    const down = (ev: KeyboardEvent) => {
      if (ev.key === "b" || ev.key === "B") setBKeyDown(true);
    };
    const up = (ev: KeyboardEvent) => {
      if (ev.key === "b" || ev.key === "B") setBKeyDown(false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const onPathNodePicked = useCallback(
    (entity: Entity) => {
      if (!entity.isAlive()) return;

      if (phase === "pickSource" || phase === "done") {
        sourceRef.current = entity;
        setSourceEntity(entity);
        setSinkEntity(null);
        setPathEntities(null);
        setSourceInfo(infoFromEntity(entity));
        setSinkInfo(null);
        setPhase("pickSink");
        return;
      }
      const src = sourceRef.current;
      if (src === null || !src.isAlive()) {
        setPhase("pickSource");
        return;
      }
      setSinkEntity(entity);
      setSinkInfo(infoFromEntity(entity));
      const path = astarGraph(src, entity, (e) =>
        e.targetsFor(WireTo).filter((t) => t.isAlive()),
      );
      setPathEntities(path);
      setPhase("done");
    },
    [phase],
  );

  const value = useMemo(
    () => ({
      phase,
      bKeyDown,
      sourceEntity,
      sinkEntity,
      pathEntities,
      sourceInfo,
      sinkInfo,
      onPathNodePicked,
    }),
    [
      phase,
      bKeyDown,
      sourceEntity,
      sinkEntity,
      pathEntities,
      sourceInfo,
      sinkInfo,
      onPathNodePicked,
    ],
  );

  return (
    <PathPickContext.Provider value={value}>{children}</PathPickContext.Provider>
  );
}

export function usePathPick() {
  const ctx = useContext(PathPickContext);
  if (!ctx) {
    throw new Error("usePathPick must be used within PathPickProvider");
  }
  return ctx;
}
