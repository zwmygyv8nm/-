"use client";

interface DecoRoomProps {
  unlockedDecos: string[];
  totalMinutes: number;
}

const ALL_DECOS: Array<{ name: string; emoji: string; threshold: number; position: string }> = [
  { name: "花瓶", emoji: "💐", threshold: 30, position: "bottom-4 right-4" },
  { name: "本棚", emoji: "📚", threshold: 100, position: "bottom-4 left-4" },
  { name: "観葉植物", emoji: "🪴", threshold: 200, position: "bottom-4 left-20" },
  { name: "時計", emoji: "🕐", threshold: 400, position: "top-4 right-4" },
  { name: "ホワイトボード", emoji: "📋", threshold: 600, position: "top-4 left-4" },
  { name: "ランプ", emoji: "🪔", threshold: 1000, position: "bottom-4 right-20" },
  { name: "賞状", emoji: "🏆", threshold: 1500, position: "top-4 right-20" },
  { name: "トロフィー", emoji: "🥇", threshold: 2500, position: "top-4 left-20" },
];

export default function DecoRoom({ unlockedDecos, totalMinutes }: DecoRoomProps) {
  const unlocked = ALL_DECOS.filter((d) => unlockedDecos.includes(d.name));
  const nextDeco = ALL_DECOS.find((d) => !unlockedDecos.includes(d.name));

  return (
    <div className="relative">
      <div className="relative w-full h-32 rounded-xl border-2 border-amber-200 bg-amber-50/50 overflow-hidden">
        {/* Floor line */}
        <div className="absolute bottom-12 left-0 w-full h-px bg-amber-200/60" />
        {/* Desk */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-40 h-8 bg-amber-800/20 rounded-t-sm border-t-2 border-amber-700/30" />

        {/* Decos */}
        {unlocked.map((deco) => (
          <div
            key={deco.name}
            className={`absolute ${deco.position} text-2xl transition-all duration-500 animate-fade-in`}
            title={deco.name}
          >
            {deco.emoji}
          </div>
        ))}

        {unlocked.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
            勉強すると部屋が育ちます
          </div>
        )}
      </div>

      {nextDeco && (
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          <span>次のデコ:</span>
          <span>{nextDeco.emoji} {nextDeco.name}</span>
          <span>
            (あと {Math.max(0, nextDeco.threshold - totalMinutes)} 分)
          </span>
          <div className="flex-1 bg-gray-200 rounded-full h-1.5 ml-1">
            <div
              className="bg-amber-400 h-1.5 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min(100, (totalMinutes / nextDeco.threshold) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
