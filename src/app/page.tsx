'use client';

import { useState, useEffect, useCallback } from 'react';
import BuddyCard from '../components/BuddyCard';
import DailyPromptCard from '../components/DailyPromptCard';
import RecorderPanel from '../components/RecorderPanel';
import ResultCard from '../components/ResultCard';
import ProgressSummary from '../components/ProgressSummary';
import BadgeList from '../components/BadgeList';
import HistoryCalendar from '../components/HistoryCalendar';
import { getTodayPrompt } from '../lib/prompts';
import { loadProgress, addRecord } from '../lib/progress';
import type { UserProgress } from '../types';
import type { SpeechRecord } from '../types';

type View = 'home' | 'record' | 'result';

export default function Home() {
  const [view, setView] = useState<View>('home');
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [lastRecord, setLastRecord] = useState<SpeechRecord | null>(null);
  const todayPrompt = getTodayPrompt();

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const handleComplete = useCallback((record: SpeechRecord) => {
    const updated = addRecord(record);
    setProgress(updated);
    setLastRecord(record);
    setView('result');
  }, []);

  const handleHome = useCallback(() => {
    setView('home');
    setLastRecord(null);
    setProgress(loadProgress());
  }, []);

  if (!progress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-md mx-auto flex flex-col gap-5">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700">はなす日記</h1>
          <p className="text-xs text-gray-400 mt-1">毎日少し、声を出してみよう</p>
        </div>

        {view === 'home' && (
          <>
            <BuddyCard buddyStage={progress.buddyStage} totalXp={progress.totalXp} />
            <ProgressSummary progress={progress} />
            <DailyPromptCard prompt={todayPrompt} />
            <button
              onClick={() => setView('record')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-400 text-white font-medium text-lg shadow-md active:scale-95 transition-transform"
            >
              今日のミッションへ
            </button>
            <BadgeList badges={progress.badges} />
            <HistoryCalendar records={progress.records} />
          </>
        )}

        {view === 'record' && (
          <>
            <button
              onClick={() => setView('home')}
              className="text-sm text-gray-400 self-start active:scale-95 transition-transform"
            >
              ← ホームに戻る
            </button>
            <RecorderPanel prompt={todayPrompt} onComplete={handleComplete} />
          </>
        )}

        {view === 'result' && lastRecord && (
          <ResultCard record={lastRecord} progress={progress} onHome={handleHome} />
        )}
      </div>
    </main>
  );
}
