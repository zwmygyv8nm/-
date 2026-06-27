"use client";

import { useState } from "react";
import { TRAVEL_LOCATIONS, TravelProgress } from "@/lib/storage";
import { PREFECTURE_PATHS, JAPAN_VIEWBOX } from "@/lib/prefecturePaths";

type LocState = "special_current" | "special" | "current" | "completed" | "unlocked" | "locked";

function getLocState(locId: string, tp: TravelProgress, isSpecial: boolean): LocState {
  const isCurrent   = tp.currentLocationId === locId;
  const isCompleted = tp.completedLocationIds.includes(locId);
  const isUnlocked  = tp.unlockedLocationIds.includes(locId);
  if (isSpecial && isCurrent)   return "special_current";
  if (isSpecial && isCompleted) return "completed";
  if (isSpecial && isUnlocked)  return "special";
  if (isCurrent)                return "current";
  if (isCompleted)              return "completed";
  if (isUnlocked)               return "unlocked";
  return "locked";
}

const FILL: Record<LocState, string> = {
  special_current: "#fbbf24",
  special:         "#fde68a",
  current:         "#6366f1",
  completed:       "#10b981",
  unlocked:        "#c7d2fe",
  locked:          "#e0e7ef",
};
const STROKE: Record<LocState, string> = {
  special_current: "#d97706",
  special:         "#f59e0b",
  current:         "#4338ca",
  completed:       "#059669",
  unlocked:        "#818cf8",
  locked:          "#cbd5e1",
};

interface Props {
  travelProgress: TravelProgress;
  onSelectLocation: (id: string) => void;
  isNight: boolean;
}

export default function TravelMapView({ travelProgress, onSelectLocation, isNight }: Props) {
  const [selectedPrefId, setSelectedPrefId] = useState<number | null>(() => {
    const cur = TRAVEL_LOCATIONS.find(l => l.id === travelProgress.currentLocationId);
    return cur?.prefId ?? null;
  });

  // Build prefId → location map
  const prefToLoc = new Map<number, typeof TRAVEL_LOCATIONS[number]>(TRAVEL_LOCATIONS.map(l => [l.prefId, l]));

  const selectedLoc = selectedPrefId != null ? prefToLoc.get(selectedPrefId) ?? null : null;
  const selectedLocState = selectedLoc
    ? getLocState(selectedLoc.id, travelProgress, "isSpecial" in selectedLoc && (selectedLoc as { isSpecial?: boolean }).isSpecial === true)
    : null;

  const isCurrentSelected   = selectedLoc?.id === travelProgress.currentLocationId;
  const isLockedSelected    = selectedLocState === "locked";
  const selectedMin         = selectedLoc ? (travelProgress.locationStudyMinutes[selectedLoc.id] ?? 0) : 0;
  const selectedRequired    = selectedLoc?.requiredMinutes ?? 60;
  const selectedPct         = Math.min(100, (selectedMin / selectedRequired) * 100);

  function getPrefFill(prefId: number, hover: boolean): string {
    const loc = prefToLoc.get(prefId);
    if (!loc) return hover ? "#d1d5db" : "#e5e9ef";
    const state = getLocState(loc.id, travelProgress, "isSpecial" in loc && (loc as { isSpecial?: boolean }).isSpecial === true);
    if (selectedPrefId === prefId) {
      // brighten selected
      const base = FILL[state];
      return base;
    }
    return hover ? FILL[state] : FILL[state] + "cc";
  }

  return (
    <div className="flex flex-col gap-3">
      {/* SVG map */}
      <div className={`rounded-2xl overflow-hidden border ${isNight ? "border-indigo-800/40 bg-indigo-950/40" : "border-gray-200 bg-slate-50"}`}>
        <svg
          viewBox={JAPAN_VIEWBOX}
          className="w-full h-auto"
          style={{ display: "block" }}
        >
          {Object.entries(PREFECTURE_PATHS).map(([idStr, pref]) => {
            const prefId = Number(idStr);
            const loc = prefToLoc.get(prefId);
            const isSelected = selectedPrefId === prefId;
            const hasLoc = loc != null;
            const state: LocState = loc
              ? getLocState(loc.id, travelProgress, "isSpecial" in loc && (loc as { isSpecial?: boolean }).isSpecial === true)
              : "locked";
            const fill   = FILL[state];
            const stroke = isSelected ? "#1e1b4b" : STROKE[state];
            const sw     = isSelected ? 2.5 : hasLoc ? 1.2 : 0.6;
            const opacity = state === "locked" && !hasLoc ? 0.55 : 1;

            return (
              <path
                key={prefId}
                d={pref.d}
                fill={fill}
                stroke={stroke}
                strokeWidth={sw}
                opacity={opacity}
                style={{ cursor: "pointer", transition: "fill 0.15s, opacity 0.15s" }}
                onClick={() => setSelectedPrefId(isSelected ? null : prefId)}
                onMouseEnter={(e) => { (e.target as SVGPathElement).style.opacity = "0.82"; }}
                onMouseLeave={(e) => { (e.target as SVGPathElement).style.opacity = String(opacity); }}
              >
                <title>{pref.nameJa}</title>
              </path>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 px-1">
        {(
          [
            ["special_current", "現在地(特別)"],
            ["current",         "現在地"],
            ["completed",       "完了"],
            ["unlocked",        "解放済"],
            ["locked",          "未解放"],
          ] as [LocState, string][]
        ).map(([state, label]) => (
          <span key={state} className="flex items-center gap-1 text-[10px]" style={{ color: isNight ? "#a5b4fc" : "#6b7280" }}>
            <span className="inline-block w-3 h-3 rounded-sm border" style={{ background: FILL[state], borderColor: STROKE[state] }} />
            {label}
          </span>
        ))}
      </div>

      {/* Detail card */}
      {selectedPrefId != null && (
        <div className={`rounded-2xl p-4 transition-all duration-200 shadow-sm border ${
          isNight ? "bg-indigo-900/60 border-indigo-800/40" : "bg-white/90 border-gray-200"
        } ${isCurrentSelected ? (isNight ? "!border-indigo-500" : "!border-indigo-300") : ""}`}>

          {selectedLoc ? (
            <>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className={`font-bold text-sm leading-tight ${isNight ? "text-white" : "text-gray-800"}`}>
                    {selectedLoc.name}
                  </h3>
                  <p className={`text-[11px] mt-0.5 ${isNight ? "text-indigo-300" : "text-indigo-500"}`}>
                    {selectedLoc.area} — {PREFECTURE_PATHS[selectedPrefId]?.nameJa}
                  </p>
                </div>
                {isCurrentSelected && (
                  <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium ${isNight ? "bg-indigo-700 text-indigo-200" : "bg-indigo-100 text-indigo-700"}`}>
                    現在地
                  </span>
                )}
                {selectedLocState === "completed" && !isCurrentSelected && (
                  <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700">
                    ✓ 完了
                  </span>
                )}
              </div>

              <p className={`text-xs mb-3 leading-relaxed ${isNight ? "text-indigo-300" : "text-gray-500"}`}>
                {"description" in selectedLoc ? (selectedLoc as { description: string }).description : ""}
              </p>

              {!isLockedSelected && (
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className={isNight ? "text-indigo-400" : "text-gray-400"}>{selectedMin}/{selectedRequired}分</span>
                    <span className={isNight ? "text-indigo-400" : "text-gray-400"}>
                      {selectedLocState === "completed" || selectedLocState === "special_current"
                        ? "完了！" : `あと ${Math.max(0, selectedRequired - selectedMin)} 分`}
                    </span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full ${isNight ? "bg-indigo-900" : "bg-gray-200"}`}>
                    <div
                      className={`h-1.5 rounded-full transition-all duration-700 ${selectedLocState === "completed" ? "bg-emerald-400" : "bg-indigo-500"}`}
                      style={{ width: `${selectedPct}%` }}
                    />
                  </div>
                </div>
              )}

              {isLockedSelected ? (
                <p className={`text-xs ${isNight ? "text-gray-500" : "text-gray-400"}`}>
                  🔒 前の自習室を {selectedRequired} 分達成すると開放されます
                </p>
              ) : isCurrentSelected ? (
                <p className={`text-xs font-medium ${isNight ? "text-indigo-400" : "text-indigo-500"}`}>
                  → 下の「この自習室に入る」から勉強を始められます
                </p>
              ) : (
                <button
                  onClick={() => { onSelectLocation(selectedLoc.id); }}
                  className="w-full py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  ここに移動する
                </button>
              )}
            </>
          ) : (
            <div>
              <h3 className={`font-bold text-sm mb-1 ${isNight ? "text-white" : "text-gray-800"}`}>
                {PREFECTURE_PATHS[selectedPrefId]?.nameJa}
              </h3>
              <p className={`text-xs ${isNight ? "text-indigo-400" : "text-gray-400"}`}>
                🔒 近日公開予定の自習室です
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
