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
// mapX/mapY: % of image width/height for public/maps/japan-map.png (square ~1052×1052)
export const TRAVEL_LOCATIONS = [
  { id: "start_room", name: "はじまりの自習室", englishName: "My Study Room",      area: "特別", description: "旅のはじまり。ここから全国へ",                                    requiredMinutes: 60, prefId: 4,  isSpecial: true, bgImage: undefined as string | undefined },
  { id: "kanazawa",   name: "石川・金沢",       englishName: "Kanazawa, Ishikawa", area: "北陸", description: "金沢駅の鼓門は、\n伝統工芸・能楽の鼓を\nイメージして作られたんだって！", requiredMinutes: 60, prefId: 17, bgImage: "/-/images/kanazawa.jpg" as string | undefined },
  { id: "toyama",     name: "富山",             englishName: "Toyama",             area: "北陸", description: "立山連峰を望みながら学ぶ",                                        requiredMinutes: 60, prefId: 16, bgImage: undefined as string | undefined },
  { id: "fukui",      name: "福井",             englishName: "Fukui",              area: "北陸", description: "恐竜の里の静かな自習室",                                          requiredMinutes: 60, prefId: 18, bgImage: undefined as string | undefined },
  { id: "kyoto",      name: "京都",             englishName: "Kyoto",              area: "近畿", description: "千年の都で机に向かう",                                            requiredMinutes: 60, prefId: 26, bgImage: undefined as string | undefined },
  { id: "tokyo",      name: "東京",             englishName: "Tokyo",              area: "関東", description: "日本の首都で集中タイム",                                          requiredMinutes: 60, prefId: 13, bgImage: undefined as string | undefined },
];

export type TravelLocationId = typeof TRAVEL_LOCATIONS[number]["id"];

export type AppMode = "select" | "virtual" | "travel" | "original";

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
const ALWAYS_UNLOCKED = ["start_room", "kanazawa"];

const TRAVEL_DEFAULTS: TravelProgress = {
  currentLocationId: "start_room",
  unlockedLocationIds: [...ALWAYS_UNLOCKED],
  completedLocationIds: [],
  locationStudyMinutes: {},
};

export function getTravelProgress(): TravelProgress {
  if (typeof window === "undefined") return { ...TRAVEL_DEFAULTS };
  const raw = localStorage.getItem(TRAVEL_KEY);
  const base: TravelProgress = raw
    ? { ...TRAVEL_DEFAULTS, ...(JSON.parse(raw) as Partial<TravelProgress>) }
    : { ...TRAVEL_DEFAULTS };
  // 常時解放の地点を確実に含める（既存ユーザーも対象）
  for (const id of ALWAYS_UNLOCKED) {
    if (!base.unlockedLocationIds.includes(id)) {
      base.unlockedLocationIds = [...base.unlockedLocationIds, id];
    }
  }
  return base;
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

/* ── AppMode ── */
const MODE_KEY = "jibun_selected_mode";

export function getSavedMode(): AppMode | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(MODE_KEY);
  if (!raw) return null;
  return raw as AppMode;
}

export function saveMode(mode: AppMode): void {
  localStorage.setItem(MODE_KEY, mode);
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
