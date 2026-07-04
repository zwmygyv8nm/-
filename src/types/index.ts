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
  // 'clear' = 5秒以上, 'tiny' = 5秒未満の小さな一声。
  // 既存データにこの項目はないが、cleared が真偽の一次情報源であり続けるため後方互換性は保たれる。
  status?: 'clear' | 'tiny';
  memo?: string; // 話したことの一言メモ（任意・最大80文字）
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
