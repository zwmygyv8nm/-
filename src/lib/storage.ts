export interface StudyLog {
  id: string;
  date: string;
  subject: string;
  duration: number; // minutes
  content: string;
  goal: string;
}

export interface SchoolProgress {
  totalMinutes: number;
  streakDays: number;
  lastStudyDate: string;
  unlockedDecos: string[];
  schoolLevel: number;
  exp: number;
}

export type BackgroundMode = "standard" | "travel" | "original";

export interface AppSettings {
  backgroundType: "template" | "custom";
  templateBg: string;
  customBgUrl: string;
  characterId: string;
  studyRoomBg: "classroom" | "gradient";
  backgroundMode: BackgroundMode;
}

/* ── 旅する自習室：地点データ ── */
export const TRAVEL_LOCATIONS = [
  { id: "kanazawa", name: "金沢",  prefecture: "石川県", description: "加賀百万石の城下町で集中する", requiredMinutes: 60 },
  { id: "toyama",   name: "富山",  prefecture: "富山県", description: "立山連峰を望みながら学ぶ",   requiredMinutes: 60 },
  { id: "fukui",    name: "福井",  prefecture: "福井県", description: "恐竜の里の静かな自習室",     requiredMinutes: 60 },
  { id: "kyoto",    name: "京都",  prefecture: "京都府", description: "千年の都で机に向かう",       requiredMinutes: 60 },
  { id: "tokyo",    name: "東京",  prefecture: "東京都", description: "日本の首都で集中タイム",     requiredMinutes: 60 },
] as const;

export type TravelLocationId = typeof TRAVEL_LOCATIONS[number]["id"];

export interface TravelProgress {
  currentLocationId: string;
  unlockedLocationIds: string[];
  completedLocationIds: string[];
  locationStudyMinutes: Record<string, number>;
}

/* ── オリジナル自習室：将来用の型定義（未実装） ── */
export interface OriginalBackground {
  id: string;
  name: string;
  // 画像はlocalStorage容量の問題からIndexedDB推奨。MVPでは未実装
  createdAt: string;
  totalStudyMinutes: number;
}

/* ── Storage keys ── */
const LOGS_KEY     = "jibun_study_logs";
const PROGRESS_KEY = "jibun_school_progress";
const SETTINGS_KEY = "jibun_settings";
const TRAVEL_KEY   = "jibun_travel_progress";

/* ── StudyLog ── */
export function getLogs(): StudyLog[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(LOGS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addLog(log: Omit<StudyLog, "id">): StudyLog {
  const newLog: StudyLog = { ...log, id: crypto.randomUUID() };
  const logs = getLogs();
  logs.push(newLog);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  return newLog;
}

/* ── SchoolProgress ── */
export function getProgress(): SchoolProgress {
  if (typeof window === "undefined") {
    return { totalMinutes: 0, streakDays: 0, lastStudyDate: "", unlockedDecos: [], schoolLevel: 1, exp: 0 };
  }
  const raw = localStorage.getItem(PROGRESS_KEY);
  return raw
    ? JSON.parse(raw)
    : { totalMinutes: 0, streakDays: 0, lastStudyDate: "", unlockedDecos: [], schoolLevel: 1, exp: 0 };
}

export function updateProgress(update: Partial<SchoolProgress>): SchoolProgress {
  const current = getProgress();
  const updated = { ...current, ...update };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
  return updated;
}

export function addStudyMinutes(minutes: number): SchoolProgress {
  const progress = getProgress();
  const today = new Date().toDateString();
  const wasYesterday = progress.lastStudyDate === new Date(Date.now() - 86400000).toDateString();

  const newStreak =
    progress.lastStudyDate === today
      ? progress.streakDays
      : wasYesterday || progress.lastStudyDate === ""
      ? progress.streakDays + 1
      : 1;

  const newExp   = progress.exp + minutes * 2;
  const newLevel = Math.floor(newExp / 200) + 1;

  const DECO_THRESHOLDS: Record<string, number> = {
    "花瓶": 30, "本棚": 100, "観葉植物": 200, "時計": 400,
    "ホワイトボード": 600, "ランプ": 1000, "賞状": 1500, "トロフィー": 2500,
  };

  const newDecos = [...progress.unlockedDecos];
  const newTotal = progress.totalMinutes + minutes;
  Object.entries(DECO_THRESHOLDS).forEach(([deco, threshold]) => {
    if (newTotal >= threshold && !newDecos.includes(deco)) newDecos.push(deco);
  });

  return updateProgress({ totalMinutes: newTotal, streakDays: newStreak, lastStudyDate: today, schoolLevel: newLevel, exp: newExp, unlockedDecos: newDecos });
}

/* ── AppSettings ── */
const SETTINGS_DEFAULTS: AppSettings = {
  backgroundType: "template",
  templateBg: "classroom",
  customBgUrl: "",
  characterId: "neko",
  studyRoomBg: "classroom",
  backgroundMode: "standard",
};

export function getSettings(): AppSettings {
  if (typeof window === "undefined") return { ...SETTINGS_DEFAULTS };
  const raw = localStorage.getItem(SETTINGS_KEY);
  return raw ? { ...SETTINGS_DEFAULTS, ...(JSON.parse(raw) as Partial<AppSettings>) } : { ...SETTINGS_DEFAULTS };
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/* ── TravelProgress ── */
const TRAVEL_DEFAULTS: TravelProgress = {
  currentLocationId: "kanazawa",
  unlockedLocationIds: ["kanazawa"],
  completedLocationIds: [],
  locationStudyMinutes: {},
};

export function getTravelProgress(): TravelProgress {
  if (typeof window === "undefined") return { ...TRAVEL_DEFAULTS };
  const raw = localStorage.getItem(TRAVEL_KEY);
  return raw ? { ...TRAVEL_DEFAULTS, ...(JSON.parse(raw) as Partial<TravelProgress>) } : { ...TRAVEL_DEFAULTS };
}

export function saveTravelProgress(progress: TravelProgress): TravelProgress {
  localStorage.setItem(TRAVEL_KEY, JSON.stringify(progress));
  return progress;
}

export function setTravelLocation(locationId: string): TravelProgress {
  const progress = getTravelProgress();
  progress.currentLocationId = locationId;
  return saveTravelProgress(progress);
}

export function addTravelMinutes(
  locationId: string,
  minutes: number,
): { progress: TravelProgress; newlyUnlockedId: string | null } {
  const progress = getTravelProgress();
  const prev = progress.locationStudyMinutes[locationId] ?? 0;
  const location = TRAVEL_LOCATIONS.find((l) => l.id === locationId);
  const cap = (location?.requiredMinutes ?? 60) + 60; // 上限（超過分は保持）
  const next = Math.min(prev + minutes, cap);
  progress.locationStudyMinutes = { ...progress.locationStudyMinutes, [locationId]: next };

  let newlyUnlockedId: string | null = null;
  const alreadyCompleted = progress.completedLocationIds.includes(locationId);

  if (!alreadyCompleted && location && next >= location.requiredMinutes) {
    progress.completedLocationIds = [...progress.completedLocationIds, locationId];
    const allIds: string[] = TRAVEL_LOCATIONS.map((l) => l.id);
    const idx = allIds.indexOf(locationId);
    if (idx >= 0 && idx < allIds.length - 1) {
      const nextId = allIds[idx + 1];
      if (!progress.unlockedLocationIds.includes(nextId)) {
        progress.unlockedLocationIds = [...progress.unlockedLocationIds, nextId];
        newlyUnlockedId = nextId;
      }
    }
  }

  return { progress: saveTravelProgress(progress), newlyUnlockedId };
}
