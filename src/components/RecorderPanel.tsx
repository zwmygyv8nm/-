'use client';

import { useCallback, useState } from 'react';
import { useRecorder, calcXp } from '../hooks/useRecorder';
import VolumeMeter from './VolumeMeter';
import type { Prompt } from '../lib/prompts';
import type { SpeechRecord } from '../types';

type RecorderPanelProps = {
  prompt: Prompt;
  onComplete: (record: SpeechRecord) => void;
};

const MEMO_MAX_LENGTH = 80;

export default function RecorderPanel({ prompt, onComplete }: RecorderPanelProps) {
  const { state, durationSec, volumeLevel, maxVolume, avgVolume, error, start, stop, reset } =
    useRecorder();
  const [memo, setMemo] = useState('');

  const cleared = durationSec >= 5;
  const xp = calcXp(durationSec);

  const buildRecord = useCallback(
    (status: 'clear' | 'tiny'): SpeechRecord => {
      const now = new Date();
      const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')}`;
      const trimmedMemo = memo.trim();
      return {
        id: `${Date.now()}`,
        date,
        prompt: prompt.text,
        category: prompt.category,
        durationSec,
        maxVolume,
        avgVolume,
        xpEarned: status === 'clear' ? xp : 0,
        cleared: status === 'clear',
        status,
        memo: trimmedMemo ? trimmedMemo.slice(0, MEMO_MAX_LENGTH) : undefined,
        createdAt: now.toISOString(),
      };
    },
    [durationSec, maxVolume, avgVolume, xp, memo, prompt]
  );

  const handleSave = useCallback(() => {
    onComplete(buildRecord('clear'));
  }, [buildRecord, onComplete]);

  const handleTinySave = useCallback(() => {
    onComplete(buildRecord('tiny'));
  }, [buildRecord, onComplete]);

  const handleRetry = useCallback(() => {
    setMemo('');
    reset();
  }, [reset]);

  return (
    <div className="flex flex-col gap-5 p-6 sm:p-7 bg-white rounded-[1.75rem] shadow-sm border border-pink-100">
      {/* お題 */}
      <div>
        <p className="text-xs text-gray-400 mb-1">{prompt.category}</p>
        <p className="text-gray-800 font-medium leading-relaxed">{prompt.text}</p>
      </div>

      {/* エラー */}
      {error && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-sm text-orange-700">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        {/* タイマー */}
        <div className="text-5xl font-light text-gray-700 tabular-nums">
          {String(Math.floor(durationSec / 60)).padStart(2, '0')}:
          {String(durationSec % 60).padStart(2, '0')}
        </div>

        {/* 録音前の安心文 */}
        {state === 'idle' && (
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            うまく話さなくて大丈夫。<br />声が少し入ればOKです。
          </p>
        )}

        {state === 'recording' && (
          <div className="flex flex-col items-center gap-2">
            <VolumeMeter volumeLevel={volumeLevel} />
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              今は練習中。きれいに話さなくて大丈夫。
            </p>
          </div>
        )}

        {/* 開始ボタン */}
        {state === 'idle' && (
          <button
            onClick={start}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-orange-300 text-white text-3xl shadow-lg active:scale-95 transition-transform hanasu-soft-glow"
          >
            🎤
          </button>
        )}

        {/* 停止ボタン */}
        {state === 'recording' && (
          <button
            onClick={stop}
            className="w-20 h-20 rounded-full bg-rose-400 text-white text-3xl shadow-lg active:scale-95 transition-transform recording-glow"
          >
            ⏹
          </button>
        )}

        {/* 停止後 */}
        {state === 'stopped' && (
          <div className="flex flex-col items-center gap-3 w-full hanasu-fade-in">
            {cleared ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center w-full">
                <p className="text-emerald-700 font-medium">声が出せました</p>
                <p className="text-emerald-600 text-sm mt-1">+{xp} XP</p>
              </div>
            ) : (
              <div className="bg-amber-50 rounded-2xl p-4 text-center w-full">
                <p className="text-amber-700 text-sm leading-relaxed">
                  少しだけ声を出せました。<br />
                  もう一回やってみても、ここで終わっても、どちらでも大丈夫です。
                </p>
              </div>
            )}

            {/* 一言メモ（任意） */}
            <div className="w-full">
              <label htmlFor="memo" className="block text-xs text-gray-400 mb-1.5">
                📝 話したことを一言だけ残す（任意）
              </label>
              <input
                id="memo"
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value.slice(0, MEMO_MAX_LENGTH))}
                maxLength={MEMO_MAX_LENGTH}
                placeholder="例：明日の予定を少し話した"
                className="w-full px-4 py-3 rounded-2xl border border-amber-100 bg-amber-50/40 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-orange-200 transition-colors"
              />
            </div>

            {cleared ? (
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleRetry}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-500 text-sm active:scale-95 transition-transform"
                >
                  もう一回
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-pink-400 to-orange-300 text-white text-sm font-medium active:scale-95 transition-transform"
                >
                  記録する
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={handleRetry}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-400 to-orange-300 text-white text-sm font-medium active:scale-95 transition-transform"
                >
                  もう一回だけ試す
                </button>
                <button
                  onClick={handleTinySave}
                  className="w-full py-3 rounded-2xl border border-gray-200 text-gray-400 text-sm active:scale-95 transition-transform"
                >
                  今日はここまで
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-300 text-center leading-relaxed">
        音声ファイルは保存されません。記録されるのは秒数や達成日などの練習データだけです。
      </p>
    </div>
  );
}
