"use client";

import { useEffect, useMemo, useRef } from "react";
import type { SkillId } from "@/types/game";
import { SKILL_LABEL, SUBJECT_COLOR, SUBJECT_LABEL } from "@/lib/game/defs";
import { getAllies, getSim, useGameStore } from "@/lib/game/store";

const SKILL_DESC: Record<SkillId, string> = {
  shadowing: "直前に味方が使ったスキルを弱体コピー",
  linearFunction: "押してから撃ちたい方向をクリック",
  dokkai: "敵の狙いを数秒間見抜く",
  knockback: "近くの敵を押し出す",
};

/**
 * 下部のスキルカード。ready/down などの状態変化(低頻度)だけReactで購読し、
 * 毎フレーム変わるクールダウン残秒・バーは rAF で直接DOMに書き込む。
 */
export function SkillPanel() {
  const epoch = useGameStore((s) => s.epoch);
  const phase = useGameStore((s) => s.phase);
  const allyStatusKey = useGameStore((s) => s.allyStatusKey);
  const enqueueSkill = useGameStore((s) => s.enqueueSkill);
  const aimingUnitId = useGameStore((s) => s.aimingUnitId);
  const setAiming = useGameStore((s) => s.setAiming);

  const allies = useMemo(() => {
    // リセット(epoch変化)時に最新のユニット参照へ取り直す。
    void epoch;
    return getAllies();
  }, [epoch]);
  const statuses = allyStatusKey.split(",");

  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const secRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const sim = getSim();
      const currentAllies = sim.units.filter((u) => u.team === "ally");
      for (let i = 0; i < currentAllies.length; i++) {
        const u = currentAllies[i];
        const bar = barRefs.current[i];
        const sec = secRefs.current[i];
        if (bar) {
          const ratio =
            u.skillCooldownMax > 0 ? u.skillCooldown / u.skillCooldownMax : 0;
          bar.style.width = `${Math.round((1 - ratio) * 100)}%`;
        }
        if (sec) {
          const next =
            u.aiState === "down"
              ? "DOWN"
              : u.skillCooldown > 0
                ? `${u.skillCooldown.toFixed(1)}s`
                : "READY";
          if (sec.textContent !== next) sec.textContent = next;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-3 sm:p-4">
      <div className="flex w-full max-w-3xl gap-2 sm:gap-3">
        {allies.map((u, i) => {
          const status = statuses[i] ?? "cooldown";
          const ready = status === "ready" && phase === "playing";
          const down = status === "down";
          const aiming = aimingUnitId === u.id;
          const handleClick = () => {
            if (u.skillId === "linearFunction") {
              // 一次関数は方向指定: 1回目でエイム開始、もう一度押すとキャンセル。
              setAiming(aiming ? null : u.id);
            } else {
              enqueueSkill(u.id);
            }
          };
          return (
            <button
              key={u.id}
              type="button"
              disabled={!ready}
              onClick={handleClick}
              className={`pointer-events-auto flex-1 rounded-2xl border-2 bg-slate-900/85 p-2.5 text-left backdrop-blur transition sm:p-3 ${
                ready
                  ? "cursor-pointer hover:bg-slate-800/90 active:scale-[0.98]"
                  : "cursor-not-allowed opacity-70"
              } ${down ? "grayscale" : ""} ${aiming ? "animate-pulse" : ""}`}
              style={{
                borderColor: aiming
                  ? "#ffffff"
                  : ready
                    ? SUBJECT_COLOR[u.subject]
                    : "#334155",
                boxShadow: aiming
                  ? `0 0 20px ${SUBJECT_COLOR[u.subject]}`
                  : ready
                    ? `0 0 14px ${SUBJECT_COLOR[u.subject]}55`
                    : "none",
              }}
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-900"
                  style={{ background: SUBJECT_COLOR[u.subject] }}
                >
                  {SUBJECT_LABEL[u.subject]}
                </span>
                <span
                  ref={(el) => {
                    secRefs.current[i] = el;
                  }}
                  className="text-[10px] font-semibold tabular-nums text-slate-300"
                >
                  --
                </span>
              </div>
              <div className="mt-1 truncate text-xs text-slate-400">{u.name}</div>
              <div className="truncate text-sm font-bold text-slate-100">
                {SKILL_LABEL[u.skillId]}
              </div>
              <div className="mt-0.5 hidden truncate text-[10px] text-slate-400 sm:block">
                {SKILL_DESC[u.skillId]}
              </div>
              {/* クールダウンバー(rAFで直接更新) */}
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-700">
                <div
                  ref={(el) => {
                    barRefs.current[i] = el;
                  }}
                  className="h-full rounded-full transition-none"
                  style={{ width: "0%", background: SUBJECT_COLOR[u.subject] }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
