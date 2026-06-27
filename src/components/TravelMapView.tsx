"use client";

import { useState } from "react";
import { TRAVEL_LOCATIONS, TravelProgress } from "@/lib/storage";

type PinState = "special_current" | "special" | "current" | "completed" | "unlocked" | "locked";

function getPinState(locId: string, tp: TravelProgress, isSpecial: boolean): PinState {
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

function PinDot({ state, label }: { state: PinState; label: string }) {
  const base = "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shadow-md select-none";

  const cls = {
    special_current: `${base} bg-yellow-400 text-yellow-900 ring-2 ring-white ring-offset-1 ring-offset-yellow-400 animate-pulse`,
    special:         `${base} bg-yellow-300 text-yellow-900 ring-1 ring-yellow-500`,
    current:         `${base} bg-indigo-600 text-white ring-2 ring-white ring-offset-1 ring-offset-indigo-600 animate-pulse`,
    completed:       `${base} bg-emerald-500 text-white`,
    unlocked:        `${base} bg-white text-gray-600 ring-2 ring-gray-400`,
    locked:          `${base} bg-gray-300/70 text-gray-400 ring-1 ring-gray-300`,
  }[state];

  const icon = {
    special_current: "⭐",
    special:         "⭐",
    current:         "●",
    completed:       "✓",
    unlocked:        "○",
    locked:          "🔒",
  }[state];

  return (
    <div className="flex flex-col items-center pointer-events-none">
      <div className={cls}>{icon}</div>
      {/* pin tail */}
      <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent"
        style={{ borderTopColor: state === "locked" ? "#c0bab2" : state.startsWith("special") ? "#f59e0b" : state === "current" ? "#4338ca" : state === "completed" ? "#10b981" : "#9ca3af" }}
      />
    </div>
  );
}

interface Props {
  travelProgress: TravelProgress;
  onSelectLocation: (id: string) => void;
  isNight: boolean;
}

export default function TravelMapView({ travelProgress, onSelectLocation, isNight }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(
    travelProgress.currentLocationId
  );

  const selectedLoc = TRAVEL_LOCATIONS.find((l) => l.id === selectedId);
  const selectedState = selectedLoc
    ? getPinState(selectedLoc.id, travelProgress, "isSpecial" in selectedLoc && (selectedLoc as { isSpecial?: boolean }).isSpecial === true)
    : null;

  const isCurrentSelected = selectedId === travelProgress.currentLocationId;
  const isLockedSelected  = selectedState === "locked";
  const isCompletedSelected = selectedState === "completed" || selectedState === "special_current";

  const selectedMin = selectedId
    ? (travelProgress.locationStudyMinutes[selectedId] ?? 0)
    : 0;
  const selectedRequired = selectedLoc?.requiredMinutes ?? 60;
  const selectedPct = Math.min(100, (selectedMin / selectedRequired) * 100);

  return (
    <div className="flex flex-col gap-3">
      {/* Map container */}
      <div className="relative w-full" style={{ paddingBottom: "138.9%" }}>
        {/* Japan SVG map */}
        <img
          src="/-/maps/japan-map.svg"
          alt="日本地図"
          className="absolute inset-0 w-full h-full object-contain rounded-xl"
          draggable={false}
        />

        {/* Location pins */}
        {TRAVEL_LOCATIONS.map((loc) => {
          const isSpecial = "isSpecial" in loc && (loc as { isSpecial?: boolean }).isSpecial === true;
          const state = getPinState(loc.id, travelProgress, isSpecial);
          const isSelected = selectedId === loc.id;

          return (
            <button
              key={loc.id}
              onClick={() => setSelectedId(isSelected ? null : loc.id)}
              className={`absolute flex flex-col items-center transition-transform duration-150
                ${isSelected ? "scale-125 z-20" : "hover:scale-110 z-10"}
                ${state === "locked" ? "opacity-60" : "opacity-100"}
              `}
              style={{
                left: `${loc.mapX}%`,
                top:  `${loc.mapY}%`,
                transform: `translate(-50%, -100%) ${isSelected ? "scale(1.25)" : ""}`,
              }}
              aria-label={loc.name}
            >
              <PinDot state={state} label={loc.name} />
            </button>
          );
        })}
      </div>

      {/* Selected location detail card */}
      {selectedLoc && (
        <div className={`rounded-2xl p-4 transition-all duration-200 ${
          isNight ? "bg-indigo-900/60" : "bg-white/90"
        } shadow-sm border ${
          isCurrentSelected
            ? isNight ? "border-indigo-500" : "border-indigo-300"
            : isNight ? "border-indigo-800/40" : "border-gray-200"
        }`}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className={`font-bold text-sm leading-tight ${isNight ? "text-white" : "text-gray-800"}`}>
                {selectedLoc.name}
              </h3>
              <p className={`text-[11px] mt-0.5 ${isNight ? "text-indigo-300" : "text-indigo-500"}`}>
                {selectedLoc.area}
              </p>
            </div>
            {isCurrentSelected && (
              <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium
                ${isNight ? "bg-indigo-700 text-indigo-200" : "bg-indigo-100 text-indigo-700"}`}>
                現在地
              </span>
            )}
            {selectedState === "completed" && !isCurrentSelected && (
              <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700">
                ✓ 完了
              </span>
            )}
          </div>

          <p className={`text-xs mb-3 leading-relaxed ${isNight ? "text-indigo-300" : "text-gray-500"}`}>
            {"description" in selectedLoc ? (selectedLoc as { description: string }).description : ""}
          </p>

          {/* Progress bar */}
          {!isLockedSelected && (
            <div className="mb-3">
              <div className="flex justify-between text-[10px] mb-1">
                <span className={isNight ? "text-indigo-400" : "text-gray-400"}>
                  {selectedMin}/{selectedRequired}分
                </span>
                <span className={isNight ? "text-indigo-400" : "text-gray-400"}>
                  {selectedState === "completed" || selectedState === "special_current"
                    ? "完了！" : `あと ${Math.max(0, selectedRequired - selectedMin)} 分`}
                </span>
              </div>
              <div className={`w-full h-1.5 rounded-full ${isNight ? "bg-indigo-900" : "bg-gray-200"}`}>
                <div
                  className={`h-1.5 rounded-full transition-all duration-700 ${
                    selectedState === "completed" ? "bg-emerald-400" : "bg-indigo-500"
                  }`}
                  style={{ width: `${selectedPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Action */}
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
              onClick={() => {
                onSelectLocation(selectedLoc.id);
                setSelectedId(selectedLoc.id);
              }}
              className="w-full py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              ここに移動する
            </button>
          )}
        </div>
      )}
    </div>
  );
}
