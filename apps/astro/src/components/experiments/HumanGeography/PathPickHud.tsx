import { usePathPick } from "./PathPickContext";

function fmt(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function Row({
  label,
  info,
}: {
  label: string;
  info: { entityId: number; x: number; y: number } | null;
}) {
  if (!info) {
    return (
      <div className="text-neutral-500">
        <span className="text-neutral-400">{label}:</span> —
      </div>
    );
  }
  return (
    <div className="font-mono text-[11px] leading-snug text-neutral-200">
      <span className="text-neutral-400">{label}:</span> id{" "}
      <span className="text-neutral-100">{info.entityId}</span>
      <span className="text-neutral-500"> · </span>x {fmt(info.x)}, y{" "}
      {fmt(info.y)}
    </div>
  );
}

export default function PathPickHud() {
  const { phase, sourceInfo, sinkInfo, pathEntities } = usePathPick();

  const phaseLabel =
    phase === "pickSource"
      ? "Pick source (hold B, click site)"
      : phase === "pickSink"
        ? "Pick sink (hold B, click site)"
        : pathEntities === null
          ? "No path (unreachable)"
          : "Path computed";

  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 w-72 select-none rounded-md border border-neutral-800 bg-neutral-950/90 px-3 py-2 text-xs shadow-lg backdrop-blur-sm">
      <div className="mb-2 text-[10px] font-medium uppercase tracking-wide text-neutral-500">
        {phaseLabel}
      </div>
      <Row label="Source" info={sourceInfo} />
      <Row label="Sink" info={sinkInfo} />
      <p className="mt-2 border-t border-neutral-800 pt-2 text-[10px] text-neutral-500">
        Variable-density blue-noise sites with Delaunay / Voronoi neighbors. Hover
        the terrain for land-use rent / cost details. Hold B and click two sites
        (when enabled) for A* on the graph. Cyan / rose mark source and sink; amber
        shows the path.
      </p>
    </div>
  );
}
