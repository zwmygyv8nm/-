'use client';

import { useState, useEffect, useCallback } from 'react';
import BuddyCard from './BuddyCard';
import DailyPromptCard from './DailyPromptCard';
import RecorderPanel from './RecorderPanel';
import ResultCard from './ResultCard';
import ProgressSummary from './ProgressSummary';
import BadgeList from './BadgeList';
import HistoryCalendar from './HistoryCalendar';
import WelcomeCard from './WelcomeCard';
import CategorySelector from './CategorySelector';
import WeeklyRecap from './WeeklyRecap';
import { getTodayPrompt, getSmartPrompt } from '../lib/prompts';
import type { Prompt } from '../lib/prompts';
import { loadProgress, addRecord } from '../lib/progress';
import type { UserProgress, SpeechRecord } from '../types';

type View = 'home' | 'record' | 'result';

const WELCOME_KEY = 'hanasu_welcome_shown';
const CATEGORY_KEY = 'hanasu_selected_category';

function loadCategory(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CATEGORY_KEY);
}

function saveCategory(cat: string | null) {
  if (typeof window === 'undefined') return;
  if (cat === null) localStorage.removeItem(CATEGORY_KEY);
  else localStorage.setItem(CATEGORY_KEY, cat);
}

function getDoneTexts(records: SpeechRecord[]): string[] {
  return records.map((r) => r.prompt);
}

export default function TalkApp() {
  const [view, setView] = useState<View>('home');
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [lastRecord, setLastRecord] = useState<SpeechRecord | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt>(getTodayPrompt());

  useEffect(() => {
    const prog = loadProgress();
    setProgress(prog);

    const shown = localStorage.getItem(WELCOME_KEY);
    if (!shown) setShowWelcome(true);

    const savedCat = loadCategory();
    setSelectedCategory(savedCat);
    const doneTexts = getDoneTexts(prog.records);
    setCurrentPrompt(getSmartPrompt(savedCat, doneTexts));
  }, []);

  const handleCloseWelcome = useCallback(() => {
    localStorage.setItem(WELCOME_KEY, '1');
    setShowWelcome(false);
  }, []);

  const handleCategoryChange = useCallback(
    (cat: string | null) => {
      setSelectedCategory(cat);
      saveCategory(cat);
      const doneTexts = getDoneTexts(progress?.records ?? []);
      setCurrentPrompt(getSmartPrompt(cat, doneTexts));
    },
    [progress]
  );

  const handleReroll = useCallback(() => {
    const doneTexts = getDoneTexts(progress?.records ?? []);
    setCurrentPrompt(getSmartPrompt(selectedCategory, doneTexts, currentPrompt.id));
  }, [selectedCategory, currentPrompt.id, progress]);

  const handleComplete = useCallback((record: SpeechRecord) => {
    const updated = addRecord(record);
    setProgress(updated);
    setLastRecord(record);
    setView('result');
  }, []);

  const handleHome = useCallback(() => {
    const prog = loadProgress();
    setProgress(prog);
    // 記録後はお題をリフレッシュ
    const doneTexts = getDoneTexts(prog.records);
    setCurrentPrompt(getSmartPrompt(selectedCategory, doneTexts));
    setLastRecord(null);
    setView('home');
  }, [selectedCategory]);

  if (!progress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">読み込み中...</p>
      </div>
    );
  }

  return (
    <>
      {showWelcome && <WelcomeCard onClose={handleCloseWelcome} />}

      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-10 px-4">
        <div className="max-w-md mx-auto flex flex-col gap-6">

          {/* ヘッダー */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-700 tracking-wide">はなす日記</h1>
            <p className="text-xs text-gray-400 mt-2">
              毎日1分。お題に答えて、話す練習を少しずつ。
            </p>
          </div>

          {view === 'home' && (
            <>
              <BuddyCard buddyStage={progress.buddyStage} totalXp={progress.totalXp} />
              <ProgressSummary progress={progress} />

              <CategorySelector selected={selectedCategory} onChange={handleCategoryChange} />

              <div className="flex flex-col gap-2">
                <DailyPromptCard prompt={currentPrompt} />
                <button
                  onClick={handleReroll}
                  className="text-sm text-purple-400 text-center py-2 active:scale-95 transition-transform"
                >
                  別のお題にする →
                </button>
              </div>

              <button
                onClick={() => setView('record')}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-400 text-white font-medium text-base shadow-md active:scale-95 transition-transform"
              >
                このお題で話してみる
              </button>

              <WeeklyRecap records={progress.records} />
              <BadgeList badges={progress.badges} />
              <HistoryCalendar records={progress.records} />

              <p className="text-xs text-gray-300 text-center leading-relaxed pb-4">
                音声ファイルは保存されません。記録されるのは秒数や達成日だけです。
              </p>
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
              <RecorderPanel
                prompt={currentPrompt}
                onComplete={handleComplete}
                onSkip={handleHome}
              />
            </>
          )}

          {view === 'result' && lastRecord && (
            <ResultCard record={lastRecord} progress={progress} onHome={handleHome} />
          )}

        </div>
      </main>
    </>
  );
}
