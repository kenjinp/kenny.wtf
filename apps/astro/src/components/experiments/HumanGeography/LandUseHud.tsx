import { useMemo } from "react";
import { useQuery } from "koota/react";
import { useLandUseHover } from "./LandUseHoverContext";
import {
  ASSUMED_TRAVEL_SPEED_KMH,
  LandUseKind,
  type LandUseKindId,
  URBAN_INNER_RADIUS,
  WORLD_UNITS_PER_METRE,
  landUseLabel,
  rentBreakdownForCell,
} from "./landUseModel";
import { LEGEND_ORDER, LAND_USE_PALETTE, rgbCss } from "./landUsePalette";
import {
  COST_LAND,
  COST_RIVER_CROSSING,
  COST_RIVER_DOWNSTREAM,
  COST_RIVER_UPSTREAM,
  COST_ROAD,
} from "./transportConstants";
import { useSiteGraph } from "./siteGraphContext";
import { Capital, EffectiveTransportDist, LandUse, LandValue, Position } from "./traits";

function fmt(n: number, digits = 1) {
  return n.toFixed(digits);
}

export default function LandUseHud() {
  const { hover } = useLandUseHover();
  const { sorted } = useSiteGraph();
  const capitals = useQuery(Capital, Position);

  const city = capitals[0];

  const tooltip = useMemo(() => {
    if (hover === null || !city?.isAlive()) return null;
    const ent = sorted[hover.siteIndex];
    if (!ent?.isAlive()) return null;
    const p = ent.get(Position)!;
    const cp = city.get(Position)!;
    const dEucl = Math.hypot(p.x - cp.x, p.y - cp.y);
    const dEff = ent.get(EffectiveTransportDist)?.value ?? dEucl;
    const bd = rentBreakdownForCell(dEucl, dEff);
    const lu = ent.get(LandUse);
    const lv = ent.get(LandValue);
    const assignedKind = (lu?.kind ??
      LandUseKind.Wilderness) as LandUseKindId;
    const assignedRent = lv?.rent ?? 0;

    return { bd, assignedKind, assignedRent, siteIndex: hover.siteIndex };
  }, [hover, sorted, city]);

  const tooltipPos = useMemo(() => {
    if (!hover) return null;
    const pad = 16;
    const tw = 360;
    const th = 320;
    let left = hover.clientX + pad;
    let top = hover.clientY + pad;
    if (typeof window !== "undefined") {
      if (left + tw > window.innerWidth - 8) left = window.innerWidth - tw - 8;
      if (top + th > window.innerHeight - 8) top = window.innerHeight - th - 8;
      left = Math.max(8, left);
      top = Math.max(8, top);
    }
    return { left, top };
  }, [hover]);

  return (
    <>
      <div className="pointer-events-none absolute bottom-4 right-4 z-10 max-w-[240px] select-none rounded-md border border-neutral-800 bg-neutral-950/90 px-3 py-2 text-xs shadow-lg backdrop-blur-sm">
        <div className="mb-2 text-[10px] font-medium uppercase tracking-wide text-neutral-500">
          Land use (Von Thünen)
        </div>
        <ul className="space-y-1.5">
          {LEGEND_ORDER.map((kind) => (
            <li key={kind} className="flex items-center gap-2 text-[11px] text-neutral-200">
              <span
                className="h-3 w-3 shrink-0 rounded-sm border border-neutral-700"
                style={{ backgroundColor: rgbCss(LAND_USE_PALETTE[kind]) }}
              />
              <span className="leading-snug">{landUseLabel(kind)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 border-t border-neutral-800 pt-2 text-[10px] leading-relaxed text-neutral-500">
          <div className="mb-1 font-medium uppercase tracking-wide text-neutral-600">
            Transport graph
          </div>
          <ul className="space-y-0.5 font-mono text-[9px] text-neutral-400">
            <li>
              land ×{COST_LAND} · road ×{COST_ROAD}
            </li>
            <li>
              river ↓ ×{COST_RIVER_DOWNSTREAM.toFixed(4)} · river ↑ ×
              {COST_RIVER_UPSTREAM.toFixed(2)}
            </li>
            <li>river crossing (no road) ×{COST_RIVER_CROSSING}</li>
          </ul>
        </div>
        <p className="mt-3 border-t border-neutral-800 pt-2 text-[10px] leading-relaxed text-neutral-500">
          Crops use net rent{" "}
          <span className="font-mono text-neutral-400">R = a − b·d</span> with{" "}
          <span className="font-mono">d</span> = shortest <em>weighted</em> path
          cost from the city (roads/rivers change it). Urban uses crow-flight
          disk <span className="font-mono">r ≤ {URBAN_INNER_RADIUS}</span>.
        </p>
        <p className="mt-2 text-[10px] text-neutral-600">
          Scale: 1 unit ≈ {1 / WORLD_UNITS_PER_METRE} m · nominal walking{" "}
          {ASSUMED_TRAVEL_SPEED_KMH} km/h for time hints.
        </p>
      </div>

      {tooltip && hover && tooltipPos && (
        <div
          className="pointer-events-none fixed z-20 w-[min(360px,calc(100vw-24px))] select-none rounded-md border border-neutral-700 bg-neutral-950/95 px-3 py-2 text-[11px] shadow-xl backdrop-blur-sm"
          style={{ left: tooltipPos.left, top: tooltipPos.top }}
        >
          <div className="mb-2 font-medium text-neutral-300">
            Site #{tooltip.siteIndex}{" "}
            <span className="font-normal text-neutral-500">
              · assigned{" "}
              <span
                className="font-medium"
                style={{ color: rgbCss(LAND_USE_PALETTE[tooltip.assignedKind]) }}
              >
                {landUseLabel(tooltip.assignedKind)}
              </span>
            </span>
          </div>
          <div className="mb-2 space-y-0.5 font-mono text-[10px] text-neutral-400">
            <div>
              Crow-flight to city{" "}
              <span className="text-neutral-200">{fmt(tooltip.bd.distance)}</span>{" "}
              u (
              <span className="text-neutral-200">
                {fmt(tooltip.bd.distance / WORLD_UNITS_PER_METRE, 0)}
              </span>{" "}
              m)
            </div>
            <div>
              Effective transport{" "}
              <span className="text-neutral-200">
                {fmt(tooltip.bd.effectiveTransport)}
              </span>{" "}
              u
            </div>
            <div>
              Time (crow-flight walk) ≈{" "}
              <span className="text-neutral-200">
                {(tooltip.bd.travelHours * 60).toFixed(1)} min
              </span>
            </div>
            <div>
              Time (eff. cost @ walk pace) ≈{" "}
              <span className="text-neutral-200">
                {(tooltip.bd.effectiveTravelHours * 60).toFixed(1)} min
              </span>
            </div>
          </div>
          <div className="mb-1 text-[10px] uppercase tracking-wide text-neutral-500">
            Rent vs effective transport (same units as{" "}
            <span className="font-mono">d</span>)
          </div>
          <table className="w-full border-collapse text-left font-mono text-[10px]">
            <thead>
              <tr className="text-neutral-500">
                <th className="py-0.5 pr-1 font-normal">Use</th>
                <th className="py-0.5 pr-1 font-normal">a</th>
                <th className="py-0.5 pr-1 font-normal">b·d</th>
                <th className="py-0.5 font-normal">R</th>
              </tr>
            </thead>
            <tbody className="text-neutral-300">
              {tooltip.bd.lines.map((row) => {
                const isWinner = row.kind === tooltip.assignedKind;
                const isUrbanRow = row.rowType === "urban";
                const showUrbanRent =
                  isUrbanRow && tooltip.bd.distance <= URBAN_INNER_RADIUS;
                return (
                  <tr
                    key={row.kind}
                    className={
                      isWinner
                        ? "bg-amber-950/40 text-amber-100"
                        : "text-neutral-400"
                    }
                  >
                    <td className="max-w-[120px] truncate py-0.5 pr-1 align-top">
                      {row.label}
                    </td>
                    <td className="py-0.5 pr-1 align-top">
                      {isUrbanRow ? "—" : fmt(row.a, 0)}
                    </td>
                    <td className="py-0.5 pr-1 align-top">
                      {isUrbanRow ? "—" : fmt(row.transportCost, 1)}
                    </td>
                    <td className="py-0.5 align-top">
                      {isUrbanRow
                        ? showUrbanRent
                          ? "reserved"
                          : "—"
                        : fmt(row.rent, 1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {tooltip.assignedKind === LandUseKind.Wilderness && (
            <p className="mt-1 text-[10px] text-neutral-400">
              No crop has positive net rent at this effective distance — tile stays
              uncultivated.
            </p>
          )}
          <p className="mt-2 border-t border-neutral-800 pt-2 text-[10px] leading-relaxed text-neutral-500">
            <span className="font-mono">b·d</span> uses effective transport{" "}
            <span className="font-mono">d</span> from the weighted graph. Assigned net
            rent:{" "}
            <span className="font-mono text-neutral-300">
              {fmt(tooltip.assignedRent, 1)}
            </span>
            .
          </p>
        </div>
      )}
    </>
  );
}
