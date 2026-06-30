export type SpeechRecord = {
  id: string;
  date: string; // YYYY-MM-DD
  prompt: string;
  category: string;
  durationSec: number;
  maxVolume?: number;
  avgVolume?: number;
  xpEarned: number;
  cleared: boolean;
  selfRating?: 'easy' | 'nervous' | 'better_than_expected' | 'retry';
  createdAt: string;
};

export type UserProgress = {
  totalXp: number;
  level: number;
  streakDays: number;
  lastCompletedDate?: string;
  records: SpeechRecord[];
  badges: string[];
  buddyStage: number;
};
