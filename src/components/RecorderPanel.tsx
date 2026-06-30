'use client';

import { useCallback } from 'react';
import { useRecorder, calcXp } from '../hooks/useRecorder';
import VolumeMeter from './VolumeMeter';
import type { Prompt } from '../lib/prompts';
import type { SpeechRecord } from '../types';

type RecorderPanelProps = {
  prompt: Prompt;
  onComplete: (record: SpeechRecord) => void;
};

export default function RecorderPanel({ prompt, onComplete }: RecorderPanelProps) {
  const { state, durationSec, volumeLevel, maxVolume, avgVolume, error, start, stop, reset } =
    useRecorder();

  const cleared = durationSec >= 5;
  const xp = calcXp(durationSec);

  const handleSave = useCallback(() => {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
    const record: SpeechRecord = {
      id: `${Date.now()}`,
      date,
      prompt: prompt.text,
      category: prompt.category,
      durationSec,
      maxVolume,
      avgVolume,
      xpEarned: xp,
      cleared,
      createdAt: now.toISOString(),
    };
    onComplete(record);
  }, [durationSec, maxVolume, avgVolume, xp, cleared, prompt, onComplete]);

  return (
    <div className="flex flex-col gap-5 p-6 bg-white rounded-3xl shadow-sm border border-pink-100">
      <div>
        <p className="text-xs text-gray-400 mb-1">{prompt.category}</p>
        <p className="text-gray-800 font-medium leading-relaxed">{prompt.text}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        <div className="text-5xl font-light text-gray-700 tabular-nums">
          {String(Math.floor(durationSec / 60)).padStart(2, '0')}:
          {String(durationSec % 60).padStart(2, '0')}
        </div>

        {state === 'recording' && <VolumeMeter volumeLevel={volumeLevel} />}

        {state === 'idle' && (
          <button
            onClick={start}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 text-white text-3xl shadow-lg active:scale-95 transition-transform"
          >
            🎤
          </button>
        )}

        {state === 'recording' && (
          <button
            onClick={stop}
            className="w-20 h-20 rounded-full bg-red-400 text-white text-3xl shadow-lg active:scale-95 transition-transform animate-pulse"
          >
            ⏹
          </button>
        )}

        {state === 'stopped' && (
          <div className="flex flex-col items-center gap-3 w-full">
            {cleared ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                <p className="text-green-700 font-medium">よく話せました！</p>
                <p className="text-green-600 text-sm mt-1">+{xp} XP 獲得</p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-center">
                <p className="text-yellow-700 text-sm">
                  少しだけ声を出せました。もう一度やってみてもOKです。
                </p>
              </div>
            )}

            <div className="flex gap-3 w-full">
              <button
                onClick={reset}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 text-sm active:scale-95 transition-transform"
              >
                やり直す
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-400 text-white text-sm font-medium active:scale-95 transition-transform"
              >
                記録する
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center leading-relaxed">
        音声ファイルは保存されません。記録されるのは、話した秒数や達成日などの練習データだけです。
      </p>
    </div>
  );
}
