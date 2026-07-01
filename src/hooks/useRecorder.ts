'use client';

import { useState, useRef, useCallback } from 'react';

export type RecorderState = 'idle' | 'recording' | 'stopped';

export function calcXp(durationSec: number): number {
  if (durationSec >= 60) return 70;
  if (durationSec >= 30) return 40;
  if (durationSec >= 10) return 20;
  if (durationSec >= 5) return 10;
  return 0;
}

export function useRecorder() {
  const [state, setState] = useState<RecorderState>('idle');
  const [durationSec, setDurationSec] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [maxVolume, setMaxVolume] = useState(0);
  const [avgVolume, setAvgVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const volumeSamplesRef = useRef<number[]>([]);
  const startTimeRef = useRef<number>(0);
  // 連打ガード: 非同期 start が完了する前の2回目の呼び出しを防ぐ
  const isStartingRef = useRef(false);

  const stopAnimation = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /** ストリームとオーディオコンテキストを安全に破棄し ref を null 化 */
  const cleanup = useCallback(() => {
    stopTimer();
    stopAnimation();

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch { /* ignore */ }
    }
    mediaRecorderRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch { /* ignore */ }
      audioContextRef.current = null;
    }
  }, [stopTimer, stopAnimation]);

  const start = useCallback(async () => {
    // 既に録音中・開始処理中なら無視（連打ガード）
    if (isStartingRef.current || streamRef.current !== null) return;
    isStartingRef.current = true;
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('お使いのブラウザは録音に対応していません。');
      isStartingRef.current = false;
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError('マイクを使えませんでした。ブラウザの設定でマイクの許可を確認してください。');
      isStartingRef.current = false;
      return;
    }

    streamRef.current = stream;

    // Web Audio API セットアップ
    try {
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      volumeSamplesRef.current = [];

      const tick = () => {
        analyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((a, b) => a + b, 0);
        const avg = sum / dataArray.length / 255;
        setVolumeLevel(avg);
        volumeSamplesRef.current.push(avg);
        setMaxVolume((prev) => Math.max(prev, avg));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      animFrameRef.current = requestAnimationFrame(tick);
    } catch {
      // Web Audio API が使えなくても録音は続行（音量バーは非表示になる）
    }

    try {
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.start();
    } catch {
      cleanup();
      setError('録音を開始できませんでした。ページを再読み込みしてからお試しください。');
      isStartingRef.current = false;
      return;
    }

    startTimeRef.current = Date.now();
    setDurationSec(0);
    setMaxVolume(0);
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setDurationSec(elapsed);
    }, 500);

    setState('recording');
    isStartingRef.current = false;
  }, [cleanup]);

  const stop = useCallback(() => {
    // 録音中でなければ無視
    if (streamRef.current === null) return;

    stopTimer();
    stopAnimation();

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch { /* ignore */ }
    }
    mediaRecorderRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch { /* ignore */ }
      audioContextRef.current = null;
    }

    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setDurationSec(elapsed);

    const samples = volumeSamplesRef.current;
    if (samples.length > 0) {
      setAvgVolume(samples.reduce((a, b) => a + b, 0) / samples.length);
    }

    setVolumeLevel(0);
    setState('stopped');
  }, [stopTimer, stopAnimation]);

  const reset = useCallback(() => {
    cleanup();
    setDurationSec(0);
    setVolumeLevel(0);
    setMaxVolume(0);
    setAvgVolume(0);
    setError(null);
    volumeSamplesRef.current = [];
    setState('idle');
  }, [cleanup]);

  return { state, durationSec, volumeLevel, maxVolume, avgVolume, error, start, stop, reset };
}
