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

// Green-map palette — base land is always green; game states use accents
const BASE_GREEN        = "#afd96e";  // all-prefecture base (matches original PNG hue)
const BASE_GREEN_STROKE = "#72a83e";  // prefecture border
const UNAVAIL_GREEN     = "#c8e8a0";  // future / not-yet-in-game prefecture

const FILL: Record<LocState, string> = {
  special_current: "#facc15",   // gold star location
  special:         "#fde68a",   // unlocked star location
  current:         "#f97316",   // orange — current destination
  completed:       "#22c55e",   // bright green — done
  unlocked:        BASE_GREEN,  // available, same green
  locked:          BASE_GREEN,  // locked, same green (opacity differs)
};
const STROKE: Record<LocState, string> = {
  special_current: "#b45309",
  special:         "#d97706",
  current:         "#c2410c",
  completed:       "#15803d",
  unlocked:        BASE_GREEN_STROKE,
  locked:          BASE_GREEN_STROKE,
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
      <div className={`rounded-2xl overflow-hidden border ${isNight ? "border-green-900/60 bg-green-950/30" : "border-green-200 bg-green-50"}`}>
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

            // All prefectures are green; only game-location states get accent colours
            const fill   = hasLoc ? FILL[state] : UNAVAIL_GREEN;
            const stroke = isSelected ? "#14532d" : (hasLoc ? STROKE[state] : BASE_GREEN_STROKE);
            const sw     = isSelected ? 2.5 : 0.8;

            return (
              <path
                key={prefId}
                d={pref.d}
                fill={fill}
                stroke={stroke}
                strokeWidth={sw}
                style={{ cursor: "pointer", transition: "filter 0.12s" }}
                onClick={() => setSelectedPrefId(isSelected ? null : prefId)}
                onMouseEnter={(e) => { (e.target as SVGPathElement).style.filter = "brightness(1.15)"; }}
                onMouseLeave={(e) => { (e.target as SVGPathElement).style.filter = ""; }}
              >
                <title>{pref.nameJa}</title>
              </path>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 px-1">
        {(
          [
            [FILL.special_current, STROKE.special_current, "現在地(特別)"],
            [FILL.current,         STROKE.current,         "現在地"],
            [FILL.completed,       STROKE.completed,       "完了"],
            [BASE_GREEN,           BASE_GREEN_STROKE,      "解放済 / 未解放"],
            [UNAVAIL_GREEN,        BASE_GREEN_STROKE,      "近日公開"],
          ] as [string, string, string][]
        ).map(([bg, border, label]) => (
          <span key={label} className="flex items-center gap-1 text-[10px]" style={{ color: isNight ? "#86efac" : "#4b7a30" }}>
            <span className="inline-block w-3 h-3 rounded-sm border" style={{ background: bg, borderColor: border }} />
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
