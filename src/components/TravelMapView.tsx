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

// Palette: transparent until cleared, then green
// Completed prefectures are permanently painted green.
// Everything else is colorless — only outlines.

// Permanent green (completed / current-in-progress)
const GREEN_FILL   = "#7fcf4a";
const GREEN_STROKE = "#4a8c22";
// Lighter tint for "unlocked but not done yet"
const TINT_FILL    = "#d4efb0";
const TINT_STROKE  = "#8ec254";
// Faint outline only (locked / unavailable)
const GHOST_STROKE = "#c8c8c8";

interface Props {
  travelProgress: TravelProgress;
  onDepart: (id: string) => void;
  isNight: boolean;
}

export default function TravelMapView({ travelProgress, onDepart, isNight }: Props) {
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

return (
    <div className="flex flex-col gap-3">
      {/* SVG map */}
      <div className={`rounded-2xl overflow-hidden border ${
        isNight ? "border-green-900/40 bg-slate-900/60" : "border-gray-200 bg-white"
      }`}>
        <svg
          viewBox={JAPAN_VIEWBOX}
          className="w-full h-auto"
          style={{ display: "block" }}
        >
          {Object.entries(PREFECTURE_PATHS).map(([idStr, pref]) => {
            const prefId = Number(idStr);
            const loc = prefToLoc.get(prefId);
            const isSelected = selectedPrefId === prefId;
            const state: LocState = loc
              ? getLocState(loc.id, travelProgress, "isSpecial" in loc && (loc as { isSpecial?: boolean }).isSpecial === true)
              : "locked";

            // Decide fill/stroke purely from completion state
            // completed or special_current (current+special while in progress) → solid green
            // current (in progress)   → solid green (you're working on it)
            // unlocked (not started)  → very light tint
            // everything else         → transparent, ghost outline only
            let fill: string;
            let stroke: string;
            let sw: number;

            if (state === "completed" || state === "special_current" || state === "current" || state === "special") {
              fill   = GREEN_FILL;
              stroke = isSelected ? "#1a4d08" : GREEN_STROKE;
              sw     = isSelected ? 2.5 : 1.2;
            } else if (state === "unlocked") {
              fill   = TINT_FILL;
              stroke = isSelected ? GREEN_STROKE : TINT_STROKE;
              sw     = isSelected ? 2.0 : 0.8;
            } else {
              // locked / unavailable → transparent
              fill   = "transparent";
              stroke = isSelected ? TINT_STROKE : GHOST_STROKE;
              sw     = isSelected ? 1.5 : 0.5;
            }

            return (
              <path
                key={prefId}
                d={pref.d}
                fill={fill}
                stroke={stroke}
                strokeWidth={sw}
                style={{ cursor: "pointer", transition: "fill 0.25s, stroke 0.25s" }}
                onClick={() => setSelectedPrefId(isSelected ? null : prefId)}
                onMouseEnter={(e) => {
                  const el = e.target as SVGPathElement;
                  if (fill === "transparent") {
                    el.setAttribute("fill", TINT_FILL);
                    el.setAttribute("stroke", TINT_STROKE);
                  } else {
                    el.style.filter = "brightness(1.12)";
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.target as SVGPathElement;
                  el.setAttribute("fill", fill);
                  el.setAttribute("stroke", stroke);
                  el.style.filter = "";
                }}
              >
                <title>{pref.nameJa}</title>
              </path>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 px-1">
        {([
          [GREEN_FILL,    GREEN_STROKE, "クリア済 / 現在地"],
          [TINT_FILL,     TINT_STROKE,  "解放済（未着手）"],
          ["transparent", GHOST_STROKE, "未解放・近日公開"],
        ] as [string, string, string][]).map(([bg, border, label]) => (
          <span key={label} className="flex items-center gap-1 text-[10px]" style={{ color: isNight ? "#9ca3af" : "#6b7280" }}>
            <span className="inline-block w-3 h-3 rounded-sm border" style={{ background: bg === "transparent" ? (isNight ? "#1e293b" : "#f8fafc") : bg, borderColor: border }} />
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
              ) : (
                <button
                  onClick={() => onDepart(selectedLoc.id)}
                  className={`w-full py-2 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-1.5 ${
                    isCurrentSelected
                      ? "bg-emerald-500 hover:bg-emerald-400 text-white"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white"
                  }`}
                >
                  {isCurrentSelected ? "✈️ ここへ出発する" : "✈️ ここへ出発する"}
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
