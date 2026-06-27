"use client";

import { useState } from "react";
import { TRAVEL_LOCATIONS, TravelProgress } from "@/lib/storage";
import { MapPin, CheckCircle2, LogIn, Map, List } from "lucide-react";
import TravelMapView from "./TravelMapView";

interface Props {
  travelProgress: TravelProgress;
  goal: string;
  onGoalChange: (g: string) => void;
  onSelectLocation: (id: string) => void;
  onStart: () => void;
  isNight: boolean;
}

export default function TravelModeScreen({
  travelProgress,
  goal,
  onGoalChange,
  onSelectLocation,
  onStart,
  isNight,
}: Props) {
  const [view, setView] = useState<"map" | "list">("map");

  const currentLoc =
    TRAVEL_LOCATIONS.find((l) => l.id === travelProgress.currentLocationId) ??
    TRAVEL_LOCATIONS[0];
  const currentMin = travelProgress.locationStudyMinutes[currentLoc.id] ?? 0;
  const progressPct = Math.min(100, (currentMin / currentLoc.requiredMinutes) * 100);
  const isCompleted = travelProgress.completedLocationIds.includes(currentLoc.id);

  return (
    <div className="animate-slide-up flex flex-col gap-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-[11px] tracking-widest ${isNight ? "text-indigo-400" : "text-gray-400"}`}>
            🗺 全国旅行モード
          </p>
          <h2 className={`text-lg font-bold mt-0.5 ${isNight ? "text-white" : "text-gray-800"}`}>
            今日の自習室を選ぼう
          </h2>
        </div>

        {/* Map / List toggle */}
        <div className={`flex rounded-xl overflow-hidden border ${isNight ? "border-indigo-700" : "border-gray-200"}`}>
          {(["map", "list"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                view === v
                  ? isNight
                    ? "bg-indigo-700 text-white"
                    : "bg-indigo-600 text-white"
                  : isNight
                  ? "text-indigo-300 hover:bg-indigo-800/40"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {v === "map" ? <Map size={13} /> : <List size={13} />}
              {v === "map" ? "地図" : "一覧"}
            </button>
          ))}
        </div>
      </div>

      {/* Current location strip */}
      <div className={`rounded-xl px-4 py-3 ${isNight ? "bg-indigo-800/40" : "bg-indigo-50/80"}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className={`text-[10px] font-bold tracking-widest mb-0.5 ${isNight ? "text-indigo-400" : "text-indigo-400"}`}>
              現在地
            </p>
            <p className={`text-sm font-bold truncate ${isNight ? "text-white" : "text-gray-800"}`}>
              <MapPin size={12} className="inline mr-1 mb-0.5 opacity-60" />
              {currentLoc.name}
              <span className={`text-[11px] font-normal ml-1.5 ${isNight ? "text-indigo-300" : "text-indigo-500"}`}>
                {currentLoc.area}
              </span>
            </p>
          </div>
          {isCompleted ? (
            <span className="shrink-0 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
              ✓ 完了
            </span>
          ) : (
            <span className={`shrink-0 text-[10px] font-medium whitespace-nowrap ${isNight ? "text-indigo-400" : "text-gray-500"}`}>
              {currentMin}/{currentLoc.requiredMinutes}分
            </span>
          )}
        </div>
        <div className={`w-full rounded-full h-1.5 mt-2 ${isNight ? "bg-indigo-900" : "bg-indigo-100"}`}>
          <div
            className={`h-1.5 rounded-full transition-all ${isCompleted ? "bg-emerald-400" : "bg-indigo-500"}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Map view */}
      {view === "map" && (
        <TravelMapView
          travelProgress={travelProgress}
          onSelectLocation={(id) => {
            onSelectLocation(id);
          }}
          isNight={isNight}
        />
      )}

      {/* List view */}
      {view === "list" && (
        <div className={`rounded-2xl overflow-hidden shadow-sm ${isNight ? "bg-indigo-900/50" : "bg-white/80"}`}>
          <div className="p-3">
            <p className={`text-[10px] font-bold tracking-widest mb-2 px-1 ${isNight ? "text-indigo-400" : "text-gray-400"}`}>
              全国の自習室
            </p>
            <div className="flex flex-col gap-0.5">
              {TRAVEL_LOCATIONS.map((loc) => {
                const isUnlocked  = travelProgress.unlockedLocationIds.includes(loc.id);
                const isDone      = travelProgress.completedLocationIds.includes(loc.id);
                const isCurrent   = travelProgress.currentLocationId === loc.id;
                const locMin      = travelProgress.locationStudyMinutes[loc.id] ?? 0;
                const special     = loc.id === "start_room";

                return (
                  <button
                    key={loc.id}
                    disabled={!isUnlocked}
                    onClick={() => isUnlocked && onSelectLocation(loc.id)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all ${
                      !isUnlocked
                        ? "opacity-30 cursor-not-allowed"
                        : isCurrent
                        ? isNight
                          ? "bg-indigo-700/60 ring-1 ring-indigo-500"
                          : "bg-indigo-50 ring-1 ring-indigo-400"
                        : isNight
                        ? "hover:bg-indigo-800/40"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-base w-5 text-center shrink-0">
                      {isDone ? "✅" : isUnlocked ? (special ? "⭐" : "📍") : "🔒"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-medium ${isNight ? "text-white" : "text-gray-800"}`}>
                        {loc.name}
                      </span>
                      <span className={`text-xs ml-1.5 ${isNight ? "text-indigo-400" : "text-gray-400"}`}>
                        {loc.area}
                      </span>
                    </div>
                    {isUnlocked && (
                      <span className={`text-[10px] tabular-nums shrink-0 ${isNight ? "text-indigo-400" : "text-gray-400"}`}>
                        {locMin}/{loc.requiredMinutes}分
                      </span>
                    )}
                    {isCurrent && (
                      <span className={`text-[10px] shrink-0 px-1.5 py-0.5 rounded-full font-medium ${isNight ? "bg-indigo-600 text-indigo-200" : "bg-indigo-100 text-indigo-600"}`}>
                        今ここ
                      </span>
                    )}
                    {isDone && !isCurrent && (
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Goal input */}
      <div className={`rounded-2xl p-4 shadow-sm ${isNight ? "bg-indigo-900/50" : "bg-white/80"}`}>
        <label className={`block text-sm font-medium mb-2 ${isNight ? "text-indigo-200" : "text-gray-700"}`}>
          📝 今日の目標
        </label>
        <input
          type="text"
          value={goal}
          onChange={(e) => onGoalChange(e.target.value)}
          placeholder="例：英単語50個覚える"
          className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
            isNight
              ? "bg-indigo-800/50 border-indigo-700 text-white placeholder-indigo-400"
              : "bg-white border-gray-200 text-gray-800 placeholder-gray-400"
          }`}
        />
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
      >
        <LogIn size={20} />
        この自習室に入る
      </button>
    </div>
  );
}
