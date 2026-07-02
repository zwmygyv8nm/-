"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { DT, MAX_FRAME_DELTA, MAX_TICKS_PER_FRAME } from "@/lib/game/defs";
import { tick } from "@/lib/game/simulate";
import { getSim, syncReactiveState, useGameStore } from "@/lib/game/store";

/**
 * ゲームループ。描画フレームごとに固定タイムステップ(30Hz)でtickを消化する。
 * - delta はクランプする(タブ復帰時の瞬間移動防止)
 * - 1フレームの最大tick数を制限する(処理落ちスパイラル防止)
 * - React へは syncReactiveState() が差分のあるときだけ通知する
 */
export function SimulationDriver() {
  const accumulatorRef = useRef(0);
  const epoch = useGameStore((s) => s.epoch);

  useEffect(() => {
    accumulatorRef.current = 0;
  }, [epoch]);

  useFrame((_, delta) => {
    accumulatorRef.current += Math.min(delta, MAX_FRAME_DELTA);
    const sim = getSim();
    let ticks = 0;
    while (accumulatorRef.current >= DT && ticks < MAX_TICKS_PER_FRAME) {
      tick(sim, DT);
      accumulatorRef.current -= DT;
      ticks++;
    }
    // 上限に達しても残りが積み上がるなら捨てる(追いつけない分は諦める)。
    if (accumulatorRef.current > DT) accumulatorRef.current = DT;
    syncReactiveState();
  });

  return null;
}
