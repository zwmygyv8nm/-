'use client';

type VolumeMeterProps = {
  volumeLevel: number; // 0〜1
};

export default function VolumeMeter({ volumeLevel }: VolumeMeterProps) {
  const bars = 12;
  const filled = Math.round(volumeLevel * bars);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* 評価ではなく「反応」として見えるよう、単一色で高さのみ変化させる */}
      <div className="flex items-end gap-1 h-8">
        {Array.from({ length: bars }).map((_, i) => {
          const active = i < filled;
          const height = 8 + (i / bars) * 24;
          return (
            <div
              key={i}
              style={{ height: `${height}px` }}
              className={`w-2 rounded-full transition-all duration-75 ${
                active ? 'bg-rose-200' : 'bg-rose-50'
              }`}
            />
          );
        })}
      </div>
      <p className="text-xs text-gray-300">マイクの反応（参考表示・採点には使いません）</p>
    </div>
  );
}
