"use client";

import { Billboard } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SUBJECT_COLOR, TEAM_COLOR } from "@/lib/game/defs";
import { getSim, useGameStore } from "@/lib/game/store";

const BODY_RADIUS = 0.32;
const BODY_STAND_Y = 0.62;
const BODY_DOWN_Y = 0.34;

/**
 * ユニット1体の描画。位置・向き・HPバー・被弾フラッシュなど
 * 毎フレーム変わる値はすべて useFrame 内の ref 更新で反映する(React再レンダーなし)。
 */
function UnitMesh({ index }: { index: number }) {
  // 静的属性(名前・チーム・科目)はリセットしても変わらないので初回だけ読む。
  const proto = getSim().units[index];
  const subjectColor = SUBJECT_COLOR[proto.subject];
  const teamColor = TEAM_COLOR[proto.team];

  const rootRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const bodyMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const hpGroupRef = useRef<THREE.Group>(null);
  const hpFillRef = useRef<THREE.Mesh>(null);
  const hpFillMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const baseColor = useMemo(() => new THREE.Color(subjectColor), [subjectColor]);
  const downColor = useMemo(
    () => new THREE.Color(subjectColor).multiplyScalar(0.3),
    [subjectColor],
  );
  // HPバーの前景: 左端を支点に scale.x で伸縮させるため、原点を左端に寄せた板を使う。
  const hpFillGeometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.9, 0.09);
    g.translate(0.45, 0, 0);
    return g;
  }, []);
  useEffect(() => () => hpFillGeometry.dispose(), [hpFillGeometry]);

  useFrame((_, delta) => {
    const sim = getSim();
    const u = sim.units[index];
    const root = rootRef.current;
    const body = bodyRef.current;
    const mat = bodyMatRef.current;
    if (!u || !root || !body || !mat) return;

    const t = sim.gameTime;
    const down = u.aiState === "down";

    root.position.set(u.pos.x, 0, u.pos.z);
    if (!down) root.rotation.y = u.facing;

    // ダウン時はその場に倒れる(短い補間でパタッと倒す)。
    const targetPitch = down ? -Math.PI / 2 : 0;
    const targetY = down ? BODY_DOWN_Y : BODY_STAND_Y;
    const blend = Math.min(1, delta * 10);
    body.rotation.x += (targetPitch - body.rotation.x) * blend;
    body.position.y += (targetY - body.position.y) * blend;

    // スキル発動時のパルス。
    const pulse =
      u.castFlashUntil > t ? 1 + 0.22 * ((u.castFlashUntil - t) / 0.4) : 1;
    root.scale.setScalar(pulse);

    // 被弾フラッシュ(emissiveを一瞬白く)とダウン時の減光。
    mat.color.copy(down ? downColor : baseColor);
    if (u.hitFlashUntil > t) {
      const k = (u.hitFlashUntil - t) / 0.18;
      mat.emissive.setScalar(0.9 * k);
    } else {
      mat.emissive.setScalar(0);
    }

    // HPバー。
    const hpGroup = hpGroupRef.current;
    const fill = hpFillRef.current;
    const fillMat = hpFillMatRef.current;
    if (hpGroup && fill && fillMat) {
      hpGroup.visible = !down;
      const ratio = Math.max(0, u.hp / u.maxHp);
      fill.scale.x = Math.max(ratio, 1e-4);
      fillMat.color.setHSL(ratio * 0.33, 0.85, 0.5);
    }
  });

  return (
    <group ref={rootRef}>
      <group ref={bodyRef} position={[0, BODY_STAND_Y, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[BODY_RADIUS, 0.6, 6, 14]} />
          <meshStandardMaterial ref={bodyMatRef} color={subjectColor} />
        </mesh>
        {/* 向きがわかる「鼻先」 */}
        <mesh position={[0, 0.18, 0.38]}>
          <boxGeometry args={[0.14, 0.14, 0.18]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      </group>

      {/* チーム識別リング(床) */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.36, 0.48, 28]} />
        <meshBasicMaterial color={teamColor} transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* HPバー(常にカメラを向く) */}
      <group ref={hpGroupRef}>
        <Billboard position={[0, 1.55, 0]}>
          {/* 背景→前景の順で描くよう、両方とも透明パスに載せて renderOrder で固定する */}
          <mesh position={[0, 0, -0.002]} renderOrder={1}>
            <planeGeometry args={[0.98, 0.15]} />
            <meshBasicMaterial color="#0f172a" transparent opacity={0.8} depthWrite={false} />
          </mesh>
          <mesh
            ref={hpFillRef}
            geometry={hpFillGeometry}
            position={[-0.45, 0, 0.002]}
            renderOrder={2}
          >
            <meshBasicMaterial
              ref={hpFillMatRef}
              color="#4ade80"
              transparent
              depthWrite={false}
            />
          </mesh>
        </Billboard>
      </group>
    </group>
  );
}

/** 全ユニットの描画。ユニット数は固定なのでマウントは一度だけ(リセット時も同じ)。 */
export function UnitsLayer() {
  // リセット(epoch変化)時に再レンダーして初期姿勢の反映を確実にする。
  useGameStore((s) => s.epoch);
  const count = getSim().units.length;
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <UnitMesh key={i} index={i} />
      ))}
    </>
  );
}
