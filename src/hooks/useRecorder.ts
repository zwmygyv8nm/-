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
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const volumeSamplesRef = useRef<number[]>([]);
  const startTimeRef = useRef<number>(0);

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

  const start = useCallback(async () => {
    setError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('お使いのブラウザは録音に対応していません。');
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError('マイクを使えませんでした。ブラウザの設定からマイク許可を確認してください。');
      return;
    }

    streamRef.current = stream;

    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

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

    const mr = new MediaRecorder(stream);
    mediaRecorderRef.current = mr;
    mr.start();

    startTimeRef.current = Date.now();
    setDurationSec(0);
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setDurationSec(elapsed);
    }, 500);

    setState('recording');
  }, []);

  const stop = useCallback(() => {
    stopTimer();
    stopAnimation();

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setDurationSec(elapsed);

    const samples = volumeSamplesRef.current;
    if (samples.length > 0) {
      const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
      setAvgVolume(avg);
    }

    setVolumeLevel(0);
    setState('stopped');
  }, [stopTimer, stopAnimation]);

  const reset = useCallback(() => {
    stopTimer();
    stopAnimation();

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setDurationSec(0);
    setVolumeLevel(0);
    setMaxVolume(0);
    setAvgVolume(0);
    setError(null);
    volumeSamplesRef.current = [];
    setState('idle');
  }, [stopTimer, stopAnimation]);

  return {
    state,
    durationSec,
    volumeLevel,
    maxVolume,
    avgVolume,
    error,
    start,
    stop,
    reset,
  };
}
