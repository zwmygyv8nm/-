"use client";

import Link from "next/link";
import { useGameStore } from "@/lib/game/store";

/** 上部HUD: 生存数・通知・勝敗オーバーレイ。低頻度更新の値だけ購読する。 */
export function BattleHud() {
  const phase = useGameStore((s) => s.phase);
  const aliveAllies = useGameStore((s) => s.aliveAllies);
  const aliveEnemies = useGameStore((s) => s.aliveEnemies);
  const notice = useGameStore((s) => s.notice);
  const aiming = useGameStore((s) => s.aimingUnitId !== null);
  const reset = useGameStore((s) => s.reset);

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col">
      {/* 上部バー */}
      <div className="flex items-start justify-between p-3 sm:p-4">
        <div className="rounded-xl bg-slate-900/70 px-3 py-2 backdrop-blur">
          <div className="text-[10px] tracking-widest text-slate-400">
            AFTER-SCHOOL TACTICS
          </div>
          <div className="text-sm font-bold text-slate-100">放課後タクティクス</div>
          <Link
            href="/"
            className="pointer-events-auto text-[11px] text-slate-400 underline-offset-2 hover:text-slate-200 hover:underline"
          >
            ← ホームへ
          </Link>
        </div>

        <div className="flex gap-2">
          <div className="rounded-xl bg-slate-900/70 px-3 py-2 text-center backdrop-blur">
            <div className="text-[10px] text-cyan-300">味方</div>
            <div className="text-lg font-bold text-cyan-200">
              {aliveAllies}
              <span className="text-xs text-slate-400"> / 3</span>
            </div>
          </div>
          <div className="rounded-xl bg-slate-900/70 px-3 py-2 text-center backdrop-blur">
            <div className="text-[10px] text-rose-300">敵</div>
            <div className="text-lg font-bold text-rose-200">
              {aliveEnemies}
              <span className="text-xs text-slate-400"> / 3</span>
            </div>
          </div>
        </div>
      </div>

      {/* スキル発動などの通知 */}
      {notice && (
        <div className="mx-auto mt-1 max-w-[90%] rounded-full bg-slate-900/80 px-4 py-1.5 text-xs text-amber-200 backdrop-blur sm:text-sm">
          {notice}
        </div>
      )}

      {/* 一次関数の方向指定ガイド */}
      {aiming && (
        <div className="mx-auto mt-2 animate-pulse rounded-full bg-emerald-500/90 px-4 py-1.5 text-xs font-bold text-slate-900 sm:text-sm">
          一次関数: 撃ちたい方向をクリック(カードをもう一度押すとキャンセル)
        </div>
      )}

      {/* 勝敗オーバーレイ */}
      {phase !== "playing" && (
        <div className="pointer-events-auto absolute inset-0 grid place-items-center bg-slate-950/60">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-slate-900/90 px-10 py-8 text-center shadow-2xl">
            <div
              className={`text-5xl font-black tracking-wider ${
                phase === "won" ? "text-amber-300" : "text-slate-400"
              }`}
            >
              {phase === "won" ? "WIN" : "LOSE"}
            </div>
            <div className="text-sm text-slate-300">
              {phase === "won"
                ? "演習制圧!放課後の教室を守り切った。"
                : "演習失敗…もう一度作戦を練ろう。"}
            </div>
            <button
              type="button"
              onClick={reset}
              className="rounded-xl bg-amber-400 px-6 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-amber-300 active:scale-95"
            >
              リトライ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
