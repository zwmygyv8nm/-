'use client';

import { useState, useEffect, useCallback } from 'react';
import BuddyCard from '../components/BuddyCard';
import DailyPromptCard from '../components/DailyPromptCard';
import RecorderPanel from '../components/RecorderPanel';
import ResultCard from '../components/ResultCard';
import ProgressSummary from '../components/ProgressSummary';
import BadgeList from '../components/BadgeList';
import HistoryCalendar from '../components/HistoryCalendar';
import WelcomeCard from '../components/WelcomeCard';
import CategorySelector from '../components/CategorySelector';
import WeeklyRecap from '../components/WeeklyRecap';
import {
  getTodayPrompt,
  getRandomPromptByCategory,
} from '../lib/prompts';
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
  if (cat === null) {
    localStorage.removeItem(CATEGORY_KEY);
  } else {
    localStorage.setItem(CATEGORY_KEY, cat);
  }
}

export default function Home() {
  const [view, setView] = useState<View>('home');
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [lastRecord, setLastRecord] = useState<SpeechRecord | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt>(getTodayPrompt());

  useEffect(() => {
    setProgress(loadProgress());
    const shown = localStorage.getItem(WELCOME_KEY);
    if (!shown) setShowWelcome(true);

    const savedCat = loadCategory();
    setSelectedCategory(savedCat);
    if (savedCat) {
      setCurrentPrompt(getRandomPromptByCategory(savedCat));
    }
  }, []);

  const handleCloseWelcome = useCallback(() => {
    localStorage.setItem(WELCOME_KEY, '1');
    setShowWelcome(false);
  }, []);

  const handleCategoryChange = useCallback((cat: string | null) => {
    setSelectedCategory(cat);
    saveCategory(cat);
    if (cat === null) {
      setCurrentPrompt(getTodayPrompt());
    } else {
      setCurrentPrompt(getRandomPromptByCategory(cat));
    }
  }, []);

  const handleReroll = useCallback(() => {
    if (selectedCategory === null) return;
    setCurrentPrompt(getRandomPromptByCategory(selectedCategory, currentPrompt.id));
  }, [selectedCategory, currentPrompt.id]);

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
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              毎日1分。お題に答えて、話す練習を少しずつ。
            </p>
          </div>

          {view === 'home' && (
            <>
              <BuddyCard buddyStage={progress.buddyStage} totalXp={progress.totalXp} />
              <ProgressSummary progress={progress} />

              {/* カテゴリ選択 */}
              <CategorySelector
                selected={selectedCategory}
                onChange={handleCategoryChange}
              />

              {/* お題カード + 別のお題ボタン */}
              <div className="flex flex-col gap-2">
                <DailyPromptCard prompt={currentPrompt} />
                {selectedCategory !== null && (
                  <button
                    onClick={handleReroll}
                    className="text-sm text-purple-400 text-center py-2 active:scale-95 transition-transform"
                  >
                    別のお題にする →
                  </button>
                )}
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
              <RecorderPanel prompt={currentPrompt} onComplete={handleComplete} />
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
