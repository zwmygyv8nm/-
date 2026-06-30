import type { UserProgress, SpeechRecord } from '../types';

const STORAGE_KEY = 'hanasu_nikki_progress';

const INITIAL_PROGRESS: UserProgress = {
  totalXp: 0,
  level: 1,
  streakDays: 0,
  lastCompletedDate: undefined,
  records: [],
  badges: [],
  buddyStage: 1,
};

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return { ...INITIAL_PROGRESS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...INITIAL_PROGRESS };
    return JSON.parse(raw) as UserProgress;
  } catch {
    return { ...INITIAL_PROGRESS };
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function calcLevel(xp: number): number {
  if (xp >= 350) return 5;
  if (xp >= 220) return 4;
  if (xp >= 120) return 3;
  if (xp >= 50) return 2;
  return 1;
}

export function calcBuddyStage(xp: number): number {
  if (xp >= 300) return 4;
  if (xp >= 150) return 3;
  if (xp >= 50) return 2;
  return 1;
}

const BADGE_DEFINITIONS: { id: string; label: string; check: (p: UserProgress) => boolean }[] = [
  {
    id: 'first_voice',
    label: 'はじめの一声',
    check: (p) => p.records.length >= 1,
  },
  {
    id: 'streak_3',
    label: '3日つづいた',
    check: (p) => p.streakDays >= 3,
  },
  {
    id: 'streak_7',
    label: '7日つづいた',
    check: (p) => p.streakDays >= 7,
  },
  {
    id: 'duration_30',
    label: '30秒話せた',
    check: (p) => p.records.some((r) => r.durationSec >= 30),
  },
  {
    id: 'duration_60',
    label: '1分話せた',
    check: (p) => p.records.some((r) => r.durationSec >= 60),
  },
];

export function checkBadges(progress: UserProgress): string[] {
  const earned: string[] = [...progress.badges];
  for (const badge of BADGE_DEFINITIONS) {
    if (!earned.includes(badge.id) && badge.check(progress)) {
      earned.push(badge.id);
    }
  }
  return earned;
}

export function getBadgeLabel(id: string): string {
  return BADGE_DEFINITIONS.find((b) => b.id === id)?.label ?? id;
}

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addRecord(record: SpeechRecord): UserProgress {
  const progress = loadProgress();
  const today = toDateString(new Date());

  progress.records = [...progress.records, record];
  progress.totalXp += record.xpEarned;
  progress.level = calcLevel(progress.totalXp);
  progress.buddyStage = calcBuddyStage(progress.totalXp);

  if (record.cleared) {
    if (progress.lastCompletedDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = toDateString(yesterday);
      if (progress.lastCompletedDate === yesterdayStr) {
        progress.streakDays += 1;
      } else {
        progress.streakDays = 1;
      }
      progress.lastCompletedDate = today;
    }
  }

  progress.badges = checkBadges(progress);
  saveProgress(progress);
  return progress;
}
