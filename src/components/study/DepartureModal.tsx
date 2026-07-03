"use client";

import { MapPin, Plane } from "lucide-react";

interface Location {
  id: string;
  name: string;
  area: string;
  description: string;
  bgImage?: string;
}

interface Props {
  location: Location;
  isNight: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DepartureModal({ location, isNight, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Sheet */}
      <div className={`relative w-full max-w-lg mx-auto rounded-t-3xl sm:rounded-3xl overflow-hidden animate-slide-up ${
        isNight ? "bg-indigo-950" : "bg-white"
      }`}>

        {/* Location image (or placeholder) */}
        <div className="relative w-full aspect-[16/9] bg-gray-200 overflow-hidden">
          {location.bgImage ? (
            <img
              src={location.bgImage}
              alt={location.name}
              className="w-full h-full object-cover"
            />
          ) : (
            /* Placeholder: attractive gradient + "準備中" */
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600">
              <span className="text-6xl mb-3">🗾</span>
              <p className="text-white/80 text-sm font-medium">背景画像 準備中</p>
              <p className="text-white/50 text-xs mt-1">{location.name}</p>
            </div>
          )}
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

          {/* Location badge over image */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin size={13} className="text-white/80" />
              <span className="text-white/80 text-xs">{location.area}</span>
            </div>
            <h2 className="text-white text-xl font-bold drop-shadow">{location.name}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className={`text-sm leading-relaxed mb-6 ${isNight ? "text-indigo-300" : "text-gray-500"}`}>
            {location.description}
          </p>

          <p className={`text-center text-base font-bold mb-6 ${isNight ? "text-white" : "text-gray-800"}`}>
            ✈️ ここへ出発しますか？
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Plane size={20} />
              出発する！
            </button>
            <button
              onClick={onCancel}
              className={`w-full py-3 rounded-2xl font-medium transition-all ${
                isNight
                  ? "bg-indigo-800/60 text-indigo-300 hover:bg-indigo-700/60"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
