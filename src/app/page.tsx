"use client";

import { useState, useEffect } from "react";
import Background from "@/components/Background";
import Character from "@/components/Character";
import DecoRoom from "@/components/DecoRoom";
import StudyRoomScreen from "@/components/StudyRoomScreen";
import ModeSelectScreen from "@/components/ModeSelectScreen";
import TravelModeScreen from "@/components/TravelModeScreen";
import TravelStudyRoomScreen from "@/components/TravelStudyRoomScreen";
import DepartureModal from "@/components/DepartureModal";
import {
  getLogs,
  getProgress,
  getSettings,
  getSavedMode,
  saveMode,
  addLog,
  addStudyMinutes,
  saveSettings,
  getTravelProgress,
  addTravelMinutes,
  setTravelLocation,
  SchoolProgress,
  AppSettings,
  AppMode,
  TravelProgress,
  StudyLog,
  TRAVEL_LOCATIONS,
} from "@/lib/storage";
import { TEMPLATE_LIST } from "@/components/Background";
import { BookOpen, BarChart2, Settings, Home, LogIn, ChevronRight, Star, LayoutGrid } from "lucide-react";

type Screen = "gate" | "room" | "log" | "complete" | "stats" | "settings";

const SUBJECTS = ["数学", "英語", "国語", "理科", "社会", "その他"];

export default function App() {
  const [screen, setScreen]   = useState<Screen>("gate");
  const [mode, setMode]       = useState<AppMode>("select");
  const [progress, setProgress]   = useState<SchoolProgress | null>(null);
  const [settings, setSettings]   = useState<AppSettings | null>(null);
  const [logs, setLogs]           = useState<StudyLog[]>([]);
  const [goal, setGoal]           = useState("");
  const [completedMinutes, setCompletedMinutes] = useState(0);
  const [logSubject, setLogSubject]   = useState("数学");
  const [logContent, setLogContent]   = useState("");
  const [newDecos, setNewDecos]       = useState<string[]>([]);
  const [travelProgress, setTravelProgress] = useState<TravelProgress | null>(null);
  const [newlyUnlockedLocation, setNewlyUnlockedLocation] = useState<string | null>(null);
  const [departureTarget, setDepartureTarget] = useState<string | null>(null);

  useEffect(() => {
    setProgress(getProgress());
    setSettings(getSettings());
    setLogs(getLogs());
    setTravelProgress(getTravelProgress());
    const saved = getSavedMode();
    if (saved && saved !== "select") setMode(saved);
  }, []);

  if (!progress || !settings || !travelProgress) return null;

  /* ── Mode select screen (full-screen, no header) ── */
  if (mode === "select") {
    return (
      <ModeSelectScreen
        onSelect={(m) => {
          saveMode(m);
          setMode(m);
        }}
      />
    );
  }

  const isNight = settings.templateBg === "night";

  const handleAttend = () => {
    if (!goal.trim()) {
      alert("今日の目標を書いてから入室しよう！");
      return;
    }
    setScreen("room");
  };

  // 旅モード：地点を選んで出発モーダルを表示
  const handleDepart = (locationId: string) => {
    if (!goal.trim()) {
      alert("今日の目標を書いてから出発しよう！");
      return;
    }
    setDepartureTarget(locationId);
  };

  // 出発確定：地点を設定してタイマー開始
  const handleDepartConfirm = () => {
    if (!departureTarget) return;
    const tp = setTravelLocation(departureTarget);
    setTravelProgress(tp);
    setDepartureTarget(null);
    setScreen("room");
  };

  const handleTimerComplete = (minutes: number) => {
    setCompletedMinutes(minutes);
    setScreen("log");
  };

  const handleSaveLog = () => {
    const today = new Date().toDateString();
    addLog({ date: today, subject: logSubject, duration: completedMinutes, content: logContent, goal });

    const prevDecos  = [...progress.unlockedDecos];
    const newProgress = addStudyMinutes(completedMinutes);
    const gained     = newProgress.unlockedDecos.filter((d) => !prevDecos.includes(d));
    setProgress(newProgress);
    setLogs(getLogs());
    setNewDecos(gained);

    if (mode === "travel") {
      const { progress: tp, newlyUnlockedId } = addTravelMinutes(travelProgress.currentLocationId, completedMinutes);
      setTravelProgress(tp);
      setNewlyUnlockedLocation(newlyUnlockedId
        ? (TRAVEL_LOCATIONS.find((l) => l.id === newlyUnlockedId)?.name ?? newlyUnlockedId)
        : null);
      setScreen("gate");
    } else {
      setNewlyUnlockedLocation(null);
      setScreen("complete");
    }
  };

  const handleSettingsSave = (newSettings: AppSettings) => {
    saveSettings(newSettings);
    setSettings({ ...newSettings });
  };

  const handleGoHome = () => {
    setGoal("");
    setLogContent("");
    setCompletedMinutes(0);
    setNewDecos([]);
    setNewlyUnlockedLocation(null);
    setScreen("gate");
  };

  const schoolLevelName = (level: number) => {
    if (level < 3)  return "入学したて";
    if (level < 6)  return "一年生";
    if (level < 10) return "二年生";
    if (level < 15) return "三年生";
    return "卒業生";
  };

  return (
    <Background
      type={settings.backgroundType}
      template={settings.templateBg}
      customUrl={settings.backgroundType === "custom" ? settings.customBgUrl : undefined}
    >
      {/* Header */}
      <header className={`sticky top-0 z-50 px-4 py-3 flex items-center justify-between backdrop-blur-md border-b ${isNight ? "border-indigo-800/40 bg-indigo-950/60 text-white" : "border-amber-100/60 bg-white/60 text-gray-800"}`}>
        <button onClick={() => setScreen("gate")} className="flex items-center gap-2 font-bold text-lg">
          <span className="text-2xl">🏫</span>
          <span>じぶん自習校</span>
        </button>
        <div className="flex items-center gap-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isNight ? "bg-indigo-700/60 text-indigo-200" : "bg-amber-100 text-amber-700"}`}>
            Lv.{progress.schoolLevel} {schoolLevelName(progress.schoolLevel)}
          </span>
          <button
            onClick={() => { saveMode("select"); setMode("select"); }}
            title="モードを変える"
            className={`p-2 rounded-full hover:bg-black/10 transition-all ${isNight ? "text-indigo-200" : "text-gray-600"}`}
          >
            <LayoutGrid size={17} />
          </button>
          <button onClick={() => setScreen("stats")} className={`p-2 rounded-full hover:bg-black/10 transition-all ${isNight ? "text-indigo-200" : "text-gray-600"}`}>
            <BarChart2 size={18} />
          </button>
          <button onClick={() => setScreen("settings")} className={`p-2 rounded-full hover:bg-black/10 transition-all ${isNight ? "text-indigo-200" : "text-gray-600"}`}>
            <Settings size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 min-h-[calc(100vh-64px)]">

        {/* ── TRAVEL MODE GATE ── */}
        {screen === "gate" && mode === "travel" && (
          <TravelModeScreen
            travelProgress={travelProgress}
            goal={goal}
            onGoalChange={setGoal}
            onDepart={handleDepart}
            isNight={isNight}
            newlyUnlockedLocation={newlyUnlockedLocation}
          />
        )}

        {/* ── VIRTUAL MODE GATE ── */}
        {screen === "gate" && mode !== "travel" && (
          <div className="animate-slide-up flex flex-col gap-6">
            <div className="text-center">
              <h1 className={`text-2xl font-bold mb-1 ${isNight ? "text-white" : "text-gray-800"}`}>
                今日も登校しよう！
              </h1>
              <p className={`text-sm ${isNight ? "text-indigo-300" : "text-gray-500"}`}>
                {new Date().toLocaleDateString("ja-JP", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "総勉強時間", value: `${progress.totalMinutes}分`, icon: "⏱" },
                { label: "連続登校",   value: `${progress.streakDays}日`,   icon: "🔥" },
                { label: "デコ数",     value: `${progress.unlockedDecos.length}個`, icon: "✨" },
              ].map((s) => (
                <div key={s.label} className={`rounded-2xl p-3 text-center ${isNight ? "bg-indigo-900/50 text-white" : "bg-white/70 text-gray-800"} shadow-sm`}>
                  <div className="text-xl">{s.icon}</div>
                  <div className="text-lg font-bold">{s.value}</div>
                  <div className={`text-xs ${isNight ? "text-indigo-300" : "text-gray-400"}`}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <Character id={settings.characterId} mood="idle" size="lg" />
            </div>
            <DecoRoom unlockedDecos={progress.unlockedDecos} totalMinutes={progress.totalMinutes} />

            {/* Goal input */}
            <div className={`rounded-2xl p-4 shadow-sm ${isNight ? "bg-indigo-900/50" : "bg-white/80"}`}>
              <label className={`block text-sm font-medium mb-2 ${isNight ? "text-indigo-200" : "text-gray-700"}`}>
                📝 今日の目標
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="例：英単語50個覚える"
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  isNight
                    ? "bg-indigo-800/50 border-indigo-700 text-white placeholder-indigo-400"
                    : "bg-white border-gray-200 text-gray-800 placeholder-gray-400"
                }`}
              />
            </div>

            <button
              onClick={handleAttend}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              登校する
            </button>
          </div>
        )}

        {/* ── STUDY ROOM (全画面没入モード) ── */}
        {/* ── 旅モード自習室 ── */}
        {screen === "room" && mode === "travel" && (() => {
          const travelLoc = TRAVEL_LOCATIONS.find((l) => l.id === travelProgress.currentLocationId)
            ?? TRAVEL_LOCATIONS[0];
          return (
            <TravelStudyRoomScreen
              goal={goal}
              characterId={settings.characterId}
              locationName={travelLoc.name}
              locationArea={travelLoc.area}
              locationDescription={travelLoc.description}
              locationBgImage={travelLoc.bgImage}
              locationStudyMinutes={travelProgress.locationStudyMinutes[travelLoc.id] ?? 0}
              locationRequiredMinutes={travelLoc.requiredMinutes}
              onComplete={handleTimerComplete}
              onExit={() => setScreen("gate")}
            />
          );
        })()}

        {/* ── バーチャルモード自習室 ── */}
        {screen === "room" && mode !== "travel" && (
          <StudyRoomScreen
            goal={goal}
            characterId={settings.characterId}
            studyRoomBg={settings.studyRoomBg}
            onComplete={handleTimerComplete}
            onExit={() => setScreen("gate")}
          />
        )}

        {/* ── LOG SCREEN ── */}
        {screen === "log" && (
          <div className="animate-slide-up flex flex-col gap-6">
            <div className="text-center">
              <div className="text-5xl mb-3">✏️</div>
              <h2 className={`text-xl font-bold ${isNight ? "text-white" : "text-gray-800"}`}>
                {completedMinutes}分、お疲れ様！
              </h2>
              <p className={`text-sm mt-1 ${isNight ? "text-indigo-300" : "text-gray-500"}`}>何を勉強したか記録しよう</p>
            </div>

            <div className={`rounded-2xl p-5 shadow-sm flex flex-col gap-4 ${isNight ? "bg-indigo-900/50" : "bg-white/80"}`}>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isNight ? "text-indigo-200" : "text-gray-700"}`}>科目</label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setLogSubject(s)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        logSubject === s
                          ? "bg-indigo-600 text-white shadow"
                          : isNight
                          ? "bg-indigo-800/60 text-indigo-200 hover:bg-indigo-700/60"
                          : "bg-gray-100 text-gray-600 hover:bg-indigo-50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isNight ? "text-indigo-200" : "text-gray-700"}`}>
                  学習内容（任意）
                </label>
                <textarea
                  value={logContent}
                  onChange={(e) => setLogContent(e.target.value)}
                  placeholder="例：二次方程式の練習問題 p.45-50"
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none ${
                    isNight
                      ? "bg-indigo-800/50 border-indigo-700 text-white placeholder-indigo-400"
                      : "bg-white border-gray-200 text-gray-800 placeholder-gray-400"
                  }`}
                />
              </div>
            </div>

            <button
              onClick={handleSaveLog}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              記録して終了 <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* ── COMPLETE SCREEN ── */}
        {screen === "complete" && (
          <div className="animate-slide-up flex flex-col gap-8 items-center text-center">
            <div className="text-7xl animate-bounce">🎉</div>
            <div>
              <h2 className={`text-2xl font-bold ${isNight ? "text-white" : "text-gray-800"}`}>
                今日もよくがんばった！
              </h2>
              <p className={`mt-2 text-sm ${isNight ? "text-indigo-300" : "text-gray-500"}`}>
                +{completedMinutes}分 / +{completedMinutes * 2}EXP
              </p>
            </div>

            <Character id={settings.characterId} mood="happy" size="lg" />

            {/* 旅モード：新地点解放 */}
            {newlyUnlockedLocation && (
              <div className={`w-full rounded-2xl p-5 shadow-sm border-2 border-emerald-300 ${isNight ? "bg-emerald-900/30" : "bg-emerald-50"}`}>
                <div className="text-3xl mb-2 text-center">🗺</div>
                <h3 className={`font-bold text-center mb-1 ${isNight ? "text-emerald-300" : "text-emerald-700"}`}>
                  次の自習室が開きました！
                </h3>
                <p className={`text-sm text-center ${isNight ? "text-emerald-400" : "text-emerald-600"}`}>
                  {newlyUnlockedLocation} の自習室へ行けます
                </p>
              </div>
            )}

            {newDecos.length > 0 && (
              <div className={`w-full rounded-2xl p-5 shadow-sm ${isNight ? "bg-indigo-900/50" : "bg-white/80"}`}>
                <h3 className={`font-bold mb-3 flex items-center justify-center gap-2 ${isNight ? "text-white" : "text-gray-800"}`}>
                  <Star size={16} className="text-yellow-400" />
                  新しいデコが解放された！
                  <Star size={16} className="text-yellow-400" />
                </h3>
                <div className="flex justify-center gap-4 flex-wrap">
                  {newDecos.map((d) => (
                    <div key={d} className="text-center animate-fade-in">
                      <div className="text-4xl mb-1">
                        {d === "花瓶" ? "💐" : d === "本棚" ? "📚" : d === "観葉植物" ? "🪴" : d === "時計" ? "🕐" : d === "ホワイトボード" ? "📋" : d === "ランプ" ? "🪔" : d === "賞状" ? "🏆" : "🥇"}
                      </div>
                      <p className={`text-xs ${isNight ? "text-indigo-300" : "text-gray-500"}`}>{d}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mode === "virtual" && (
              <div className={`w-full rounded-2xl p-5 shadow-sm ${isNight ? "bg-indigo-900/50" : "bg-white/80"}`}>
                <DecoRoom unlockedDecos={progress.unlockedDecos} totalMinutes={progress.totalMinutes} />
              </div>
            )}

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => setScreen("room")}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <BookOpen size={18} />
                もう一コマ勉強する
              </button>
              <button
                onClick={handleGoHome}
                className={`w-full py-3 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${
                  isNight
                    ? "bg-indigo-800/50 text-indigo-200 hover:bg-indigo-700/50"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Home size={18} />
                今日はここまで
              </button>
            </div>
          </div>
        )}

        {/* ── STATS SCREEN ── */}
        {screen === "stats" && (
          <div className="animate-slide-up flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setScreen("gate")}
                className={`p-2 rounded-full hover:bg-black/10 ${isNight ? "text-indigo-200" : "text-gray-600"}`}
              >
                ←
              </button>
              <h2 className={`text-xl font-bold ${isNight ? "text-white" : "text-gray-800"}`}>学習記録</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "総勉強時間", value: `${progress.totalMinutes}分`, sub: `約${Math.floor(progress.totalMinutes / 60)}時間`, icon: "⏱" },
                { label: "連続登校", value: `${progress.streakDays}日`, sub: "継続中！", icon: "🔥" },
                { label: "校舎レベル", value: `Lv.${progress.schoolLevel}`, sub: schoolLevelName(progress.schoolLevel), icon: "🏫" },
                { label: "解放デコ", value: `${progress.unlockedDecos.length}個`, sub: "集めてみよう", icon: "✨" },
              ].map((s) => (
                <div key={s.label} className={`rounded-2xl p-4 ${isNight ? "bg-indigo-900/50 text-white" : "bg-white/80 text-gray-800"} shadow-sm`}>
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className={`text-xs font-medium ${isNight ? "text-indigo-300" : "text-gray-500"}`}>{s.label}</div>
                  <div className={`text-xs ${isNight ? "text-indigo-400" : "text-gray-400"}`}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Subject breakdown */}
            {logs.length > 0 && (() => {
              const bySubject: Record<string, number> = {};
              logs.forEach((l) => { bySubject[l.subject] = (bySubject[l.subject] || 0) + l.duration; });
              const total = Object.values(bySubject).reduce((a, b) => a + b, 0);
              return (
                <div className={`rounded-2xl p-4 shadow-sm ${isNight ? "bg-indigo-900/50" : "bg-white/80"}`}>
                  <h3 className={`font-bold mb-3 ${isNight ? "text-white" : "text-gray-800"}`}>科目別時間</h3>
                  <div className="flex flex-col gap-2">
                    {Object.entries(bySubject).sort(([, a], [, b]) => b - a).map(([sub, min]) => (
                      <div key={sub} className="flex items-center gap-2">
                        <span className={`text-sm w-14 ${isNight ? "text-indigo-200" : "text-gray-600"}`}>{sub}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${(min / total) * 100}%` }} />
                        </div>
                        <span className={`text-xs w-12 text-right ${isNight ? "text-indigo-300" : "text-gray-400"}`}>{min}分</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Recent logs */}
            <div className={`rounded-2xl p-4 shadow-sm ${isNight ? "bg-indigo-900/50" : "bg-white/80"}`}>
              <h3 className={`font-bold mb-3 ${isNight ? "text-white" : "text-gray-800"}`}>最近の記録</h3>
              {logs.length === 0 ? (
                <p className={`text-sm text-center py-4 ${isNight ? "text-indigo-400" : "text-gray-400"}`}>
                  まだ記録がありません
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {[...logs].reverse().slice(0, 10).map((log) => (
                    <div key={log.id} className={`flex items-start gap-3 py-2 border-b last:border-0 ${isNight ? "border-indigo-800/40" : "border-gray-100"}`}>
                      <div className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap mt-0.5 ${isNight ? "bg-indigo-700/50 text-indigo-200" : "bg-indigo-50 text-indigo-600"}`}>
                        {log.subject}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isNight ? "text-white" : "text-gray-800"}`}>
                          {log.goal || log.content || "記録なし"}
                        </p>
                        {log.content && log.goal && (
                          <p className={`text-xs truncate ${isNight ? "text-indigo-400" : "text-gray-400"}`}>{log.content}</p>
                        )}
                        <p className={`text-xs ${isNight ? "text-indigo-400" : "text-gray-400"}`}>{log.date}</p>
                      </div>
                      <span className={`text-sm font-medium whitespace-nowrap ${isNight ? "text-indigo-300" : "text-gray-500"}`}>{log.duration}分</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SETTINGS SCREEN ── */}
        {screen === "settings" && (
          <SettingsScreen
            settings={settings}
            isNight={isNight}
            onSave={(s) => { handleSettingsSave(s); setScreen("gate"); }}
            onBack={() => setScreen("gate")}
          />
        )}

      </main>

      {/* 出発確認モーダル（旅モード） */}
      {departureTarget && (() => {
        const loc = TRAVEL_LOCATIONS.find((l) => l.id === departureTarget);
        if (!loc) return null;
        return (
          <DepartureModal
            location={loc}
            isNight={isNight}
            onConfirm={handleDepartConfirm}
            onCancel={() => setDepartureTarget(null)}
          />
        );
      })()}
    </Background>
  );
}

/* ── Settings sub-component ── */
function SettingsScreen({
  settings,
  isNight,
  onSave,
  onBack,
}: {
  settings: AppSettings;
  isNight: boolean;
  onSave: (s: AppSettings) => void;
  onBack: () => void;
}) {
  const [local, setLocal] = useState<AppSettings>({ ...settings });

  const CHARACTERS = [
    { id: "neko",  name: "ねこ先輩",   emoji: "🐱" },
    { id: "shiro", name: "しろうさぎ", emoji: "🐰" },
    { id: "kuma",  name: "くまっち",   emoji: "🐻" },
  ];

  return (
    <div className="animate-slide-up flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className={`p-2 rounded-full hover:bg-black/10 ${isNight ? "text-indigo-200" : "text-gray-600"}`}>←</button>
        <h2 className={`text-xl font-bold ${isNight ? "text-white" : "text-gray-800"}`}>設定</h2>
      </div>

      {/* Background（ホーム画面の背景テーマ） */}
      <div className={`rounded-2xl p-5 shadow-sm ${isNight ? "bg-indigo-900/50" : "bg-white/80"}`}>
        <h3 className={`font-bold mb-4 ${isNight ? "text-white" : "text-gray-800"}`}>🖼 ホーム背景</h3>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATE_LIST.map((t) => (
            <button
              key={t.id}
              onClick={() => setLocal((prev) => ({ ...prev, backgroundType: "template", templateBg: t.id }))}
              className={`py-3 px-3 rounded-xl text-sm font-medium transition-all border-2 ${
                local.templateBg === t.id && local.backgroundType === "template"
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : isNight
                  ? "border-indigo-700 bg-indigo-800/40 text-indigo-200 hover:border-indigo-500"
                  : "border-gray-200 bg-white text-gray-600 hover:border-indigo-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Character */}
      <div className={`rounded-2xl p-5 shadow-sm ${isNight ? "bg-indigo-900/50" : "bg-white/80"}`}>
        <h3 className={`font-bold mb-4 ${isNight ? "text-white" : "text-gray-800"}`}>🐾 相棒キャラクター</h3>
        <div className="flex gap-3 justify-center">
          {CHARACTERS.map((c) => (
            <button
              key={c.id}
              onClick={() => setLocal((prev) => ({ ...prev, characterId: c.id }))}
              className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                local.characterId === c.id
                  ? "border-indigo-500 bg-indigo-50 scale-105 shadow-md"
                  : isNight
                  ? "border-indigo-700 hover:border-indigo-500"
                  : "border-gray-200 hover:border-indigo-300"
              }`}
            >
              <span className="text-4xl mb-1">{c.emoji}</span>
              <span className={`text-xs font-medium ${isNight ? "text-indigo-200" : "text-gray-600"}`}>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 自習室背景 */}
      <div className={`rounded-2xl p-5 shadow-sm ${isNight ? "bg-indigo-900/50" : "bg-white/80"}`}>
        <h3 className={`font-bold mb-4 ${isNight ? "text-white" : "text-gray-800"}`}>📚 自習室の背景</h3>
        <div className="flex gap-2">
          {([
            { id: "classroom", label: "放課後の教室", emoji: "🏫" },
            { id: "gradient",  label: "シンプル夕暮れ", emoji: "🌇" },
          ] as const).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setLocal((prev) => ({ ...prev, studyRoomBg: opt.id }))}
              className={`flex-1 py-3 px-3 rounded-xl text-sm font-medium transition-all border-2 ${
                (local.studyRoomBg ?? "classroom") === opt.id
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : isNight
                  ? "border-indigo-700 bg-indigo-800/40 text-indigo-200 hover:border-indigo-500"
                  : "border-gray-200 bg-white text-gray-600 hover:border-indigo-300"
              }`}
            >
              <div className="text-xl mb-1">{opt.emoji}</div>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onSave(local)}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg transition-all hover:-translate-y-0.5"
      >
        保存する
      </button>
    </div>
  );
}
