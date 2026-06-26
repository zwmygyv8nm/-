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

export interface AppSettings {
  backgroundType: "template" | "custom";
  templateBg: string;
  customBgUrl: string;
  characterId: string;
}

const LOGS_KEY = "jibun_study_logs";
const PROGRESS_KEY = "jibun_school_progress";
const SETTINGS_KEY = "jibun_settings";

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

export function getProgress(): SchoolProgress {
  if (typeof window === "undefined") {
    return {
      totalMinutes: 0,
      streakDays: 0,
      lastStudyDate: "",
      unlockedDecos: [],
      schoolLevel: 1,
      exp: 0,
    };
  }
  const raw = localStorage.getItem(PROGRESS_KEY);
  return raw
    ? JSON.parse(raw)
    : {
        totalMinutes: 0,
        streakDays: 0,
        lastStudyDate: "",
        unlockedDecos: [],
        schoolLevel: 1,
        exp: 0,
      };
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
  const wasYesterday =
    progress.lastStudyDate ===
    new Date(Date.now() - 86400000).toDateString();

  const newStreak =
    progress.lastStudyDate === today
      ? progress.streakDays
      : wasYesterday || progress.lastStudyDate === ""
      ? progress.streakDays + 1
      : 1;

  const newExp = progress.exp + minutes * 2;
  const newLevel = Math.floor(newExp / 200) + 1;

  const DECO_THRESHOLDS: Record<string, number> = {
    "花瓶": 30,
    "本棚": 100,
    "観葉植物": 200,
    "時計": 400,
    "ホワイトボード": 600,
    "ランプ": 1000,
    "賞状": 1500,
    "トロフィー": 2500,
  };

  const newDecos = [...progress.unlockedDecos];
  const newTotal = progress.totalMinutes + minutes;
  Object.entries(DECO_THRESHOLDS).forEach(([deco, threshold]) => {
    if (newTotal >= threshold && !newDecos.includes(deco)) {
      newDecos.push(deco);
    }
  });

  return updateProgress({
    totalMinutes: newTotal,
    streakDays: newStreak,
    lastStudyDate: today,
    schoolLevel: newLevel,
    exp: newExp,
    unlockedDecos: newDecos,
  });
}

export function getSettings(): AppSettings {
  if (typeof window === "undefined") {
    return {
      backgroundType: "template",
      templateBg: "classroom",
      customBgUrl: "",
      characterId: "neko",
    };
  }
  const raw = localStorage.getItem(SETTINGS_KEY);
  return raw
    ? JSON.parse(raw)
    : {
        backgroundType: "template",
        templateBg: "classroom",
        customBgUrl: "",
        characterId: "neko",
      };
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
