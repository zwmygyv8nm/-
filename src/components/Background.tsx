"use client";

interface BackgroundProps {
  type: "template" | "custom";
  template?: string;
  customUrl?: string;
  children: React.ReactNode;
}

const TEMPLATES: Record<string, { gradient: string; pattern: string; label: string }> = {
  classroom: {
    gradient: "from-amber-50 via-yellow-50 to-orange-50",
    pattern: "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100 via-yellow-50 to-white",
    label: "クラシック教室",
  },
  night: {
    gradient: "from-indigo-950 via-blue-950 to-slate-900",
    pattern: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-blue-950 to-slate-900",
    label: "夜の自習室",
  },
  cafe: {
    gradient: "from-stone-100 via-amber-50 to-stone-50",
    pattern: "bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-stone-200 via-amber-50 to-stone-100",
    label: "カフェ風",
  },
  nature: {
    gradient: "from-green-50 via-emerald-50 to-teal-50",
    pattern: "bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-green-100 via-emerald-50 to-teal-50",
    label: "自然の中",
  },
};

export const TEMPLATE_LIST = Object.entries(TEMPLATES).map(([id, val]) => ({
  id,
  ...val,
}));

export default function Background({ type, template = "classroom", customUrl, children }: BackgroundProps) {
  const bg = TEMPLATES[template] || TEMPLATES.classroom;
  const isNight = template === "night";

  if (type === "custom" && customUrl) {
    return (
      <div
        className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${customUrl})` }}
      >
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
        <div className="relative z-10 min-h-screen">{children}</div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen w-full ${bg.pattern}`}>
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-0 w-full h-2 ${isNight ? "bg-indigo-800/50" : "bg-amber-200/40"}`} />
        <div className={`absolute top-2 left-0 w-full h-px ${isNight ? "bg-indigo-700/30" : "bg-amber-300/30"}`} />
        {isNight && (
          <>
            <div className="absolute top-8 left-12 w-1 h-1 rounded-full bg-white/70 animate-pulse" />
            <div className="absolute top-16 left-32 w-0.5 h-0.5 rounded-full bg-white/50 animate-pulse delay-300" />
            <div className="absolute top-6 right-20 w-1 h-1 rounded-full bg-white/60 animate-pulse delay-700" />
            <div className="absolute top-20 right-40 w-0.5 h-0.5 rounded-full bg-white/40 animate-pulse delay-1000" />
          </>
        )}
      </div>
      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
}
