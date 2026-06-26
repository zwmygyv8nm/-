"use client";

interface CharacterProps {
  id: string;
  mood?: "idle" | "studying" | "happy";
  size?: "sm" | "md" | "lg";
}

const CHARACTERS: Record<string, { emoji: string; name: string; color: string }> = {
  neko: { emoji: "🐱", name: "ねこ先輩", color: "#f9a8d4" },
  shiro: { emoji: "🐰", name: "しろうさぎ", color: "#a5f3fc" },
  kuma: { emoji: "🐻", name: "くまっち", color: "#fde68a" },
};

const SIZE_CLASS: Record<string, string> = {
  sm: "text-4xl",
  md: "text-7xl",
  lg: "text-9xl",
};

const MESSAGES: Record<string, string[]> = {
  idle: ["いっしょにがんばろう！", "今日も登校したね！", "さあ、始めよう♪"],
  studying: ["集中してるね！", "いいぞ、その調子！", "ファイト！"],
  happy: ["やったー！", "すごい！勉強したね！", "また明日も来てね！"],
};

export default function Character({ id, mood = "idle", size = "md" }: CharacterProps) {
  const char = CHARACTERS[id] || CHARACTERS.neko;
  const messages = MESSAGES[mood];
  const message = messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div
        className="relative inline-block"
        style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.15))" }}
      >
        <div
          className={`${SIZE_CLASS[size]} transition-transform duration-300 hover:scale-110 cursor-default`}
          role="img"
          aria-label={char.name}
        >
          {char.emoji}
        </div>
        {mood === "studying" && (
          <span className="absolute -top-2 -right-2 text-xl animate-bounce">✏️</span>
        )}
        {mood === "happy" && (
          <span className="absolute -top-2 -right-2 text-xl animate-spin">⭐</span>
        )}
      </div>
      <div
        className="relative px-3 py-1.5 rounded-2xl text-sm font-medium text-gray-700 max-w-[160px] text-center"
        style={{ backgroundColor: char.color + "cc", backdropFilter: "blur(4px)" }}
      >
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs">▲</span>
        {message}
      </div>
      <p className="text-xs text-gray-500">{char.name}</p>
    </div>
  );
}

export { CHARACTERS };
