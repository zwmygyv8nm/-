'use client';

type VolumeMeterProps = {
  volumeLevel: number; // 0〜1
};

export default function VolumeMeter({ volumeLevel }: VolumeMeterProps) {
  const bars = 12;
  const filled = Math.round(volumeLevel * bars);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-end gap-1 h-8">
        {Array.from({ length: bars }).map((_, i) => {
          const active = i < filled;
          const height = 8 + (i / bars) * 24;
          return (
            <div
              key={i}
              style={{ height: `${height}px` }}
              className={`w-2 rounded-full transition-all duration-75 ${
                active
                  ? i < bars * 0.5
                    ? 'bg-mint-400 bg-green-300'
                    : i < bars * 0.8
                    ? 'bg-yellow-300'
                    : 'bg-pink-300'
                  : 'bg-gray-200'
              }`}
            />
          );
        })}
      </div>
      <p className="text-xs text-gray-400">音量の参考表示です</p>
    </div>
  );
}
