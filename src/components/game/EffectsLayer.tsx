"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Vec2 } from "@/types/game";
import { isAlive } from "@/lib/game/combat";
import { getSim } from "@/lib/game/store";

// エフェクトは「固定プールへの毎フレーム割り当て」で描画する。
// スキル発動のたびにReactツリーを組み替えないため、再レンダーはゼロ。
// プール(可変なthreeオブジェクト群)は useEffect で生成してrefに保持し、
// render中はrefを読まない(react-hooks/refs 準拠)。

const SHOT_POOL = 16;
const BEAM_POOL = 6;
const REVEAL_POOL = 6;

const SHOT_Y = 0.85;
const BEAM_Y = 0.9;
const REVEAL_COLOR = "#fde047";

interface PooledLine {
  obj: THREE.Line;
  mat: THREE.LineBasicMaterial;
  positions: THREE.BufferAttribute;
}

function makePooledLine(): PooledLine {
  const geom = new THREE.BufferGeometry();
  const positions = new THREE.BufferAttribute(new Float32Array(6), 3);
  geom.setAttribute("position", positions);
  const mat = new THREE.LineBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const obj = new THREE.Line(geom, mat);
  obj.visible = false;
  obj.frustumCulled = false;
  return { obj, mat, positions };
}

function setLine(
  line: PooledLine,
  from: Vec2,
  to: Vec2,
  y0: number,
  y1: number,
  color: string,
  opacity: number,
) {
  const a = line.positions.array as Float32Array;
  a[0] = from.x;
  a[1] = y0;
  a[2] = from.z;
  a[3] = to.x;
  a[4] = y1;
  a[5] = to.z;
  line.positions.needsUpdate = true;
  line.mat.color.set(color);
  line.mat.opacity = opacity;
  line.obj.visible = true;
}

interface EffectPool {
  group: THREE.Group;
  shots: PooledLine[];
  beams: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial }[];
  beamGeom: THREE.BoxGeometry;
  revealLines: PooledLine[];
  coneGeom: THREE.ConeGeometry;
  revealMarks: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial }[];
}

function createEffectPool(): EffectPool {
  const group = new THREE.Group();

  const shots = Array.from({ length: SHOT_POOL }, makePooledLine);
  shots.forEach((l) => group.add(l.obj));

  const beamGeom = new THREE.BoxGeometry(1, 0.08, 0.08);
  const beams = Array.from({ length: BEAM_POOL }, () => {
    const mat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(beamGeom, mat);
    mesh.visible = false;
    mesh.frustumCulled = false;
    group.add(mesh);
    return { mesh, mat };
  });

  const revealLines = Array.from({ length: REVEAL_POOL }, makePooledLine);
  revealLines.forEach((l) => group.add(l.obj));

  const coneGeom = new THREE.ConeGeometry(0.17, 0.3, 10);
  const revealMarks = Array.from({ length: REVEAL_POOL }, () => {
    const mat = new THREE.MeshBasicMaterial({
      color: REVEAL_COLOR,
      transparent: true,
      opacity: 0.95,
    });
    const mesh = new THREE.Mesh(coneGeom, mat);
    mesh.rotation.x = Math.PI; // 下向きの矢印にする
    mesh.visible = false;
    mesh.frustumCulled = false;
    group.add(mesh);
    return { mesh, mat };
  });

  return { group, shots, beams, beamGeom, revealLines, coneGeom, revealMarks };
}

function disposeEffectPool(pool: EffectPool) {
  pool.shots.forEach((l) => {
    l.obj.geometry.dispose();
    l.mat.dispose();
  });
  pool.revealLines.forEach((l) => {
    l.obj.geometry.dispose();
    l.mat.dispose();
  });
  pool.beams.forEach((b) => b.mat.dispose());
  pool.revealMarks.forEach((m) => m.mat.dispose());
  pool.beamGeom.dispose();
  pool.coneGeom.dispose();
}

export function EffectsLayer() {
  const anchorRef = useRef<THREE.Group>(null);
  const poolRef = useRef<EffectPool | null>(null);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const pool = createEffectPool();
    anchor.add(pool.group);
    poolRef.current = pool;
    return () => {
      poolRef.current = null;
      anchor.remove(pool.group);
      disposeEffectPool(pool);
    };
  }, []);

  useFrame((frame) => {
    const pool = poolRef.current;
    if (!pool) return;
    const sim = getSim();
    const t = sim.gameTime;
    let shotIdx = 0;
    let beamIdx = 0;

    for (const e of sim.effects) {
      const fade = Math.max(0, Math.min(1, (e.until - t) / e.duration));
      if (e.kind === "shot" && shotIdx < SHOT_POOL) {
        setLine(pool.shots[shotIdx++], e.from, e.to, SHOT_Y, SHOT_Y, e.color, 0.9 * fade);
      } else if (e.kind === "beam" && beamIdx < BEAM_POOL) {
        const b = pool.beams[beamIdx++];
        const dx = e.to.x - e.from.x;
        const dz = e.to.z - e.from.z;
        const len = Math.max(Math.hypot(dx, dz), 1e-4);
        b.mesh.position.set((e.from.x + e.to.x) / 2, BEAM_Y, (e.from.z + e.to.z) / 2);
        b.mesh.scale.set(len, 1, 1);
        b.mesh.rotation.y = Math.atan2(-dz, dx);
        b.mat.color.set(e.color);
        b.mat.opacity = 0.4 + 0.55 * fade;
        b.mesh.visible = true;
      }
    }

    // 読解: 対象ユニットから「現在狙っている相手」への線と、頭上のマーカー。
    let revealIdx = 0;
    for (const u of sim.units) {
      if (revealIdx >= REVEAL_POOL) break;
      if (u.revealedUntil <= t || !isAlive(u)) continue;
      const target = u.targetId
        ? sim.units.find((x) => x.id === u.targetId)
        : undefined;

      const mark = pool.revealMarks[revealIdx];
      mark.mesh.position.set(u.pos.x, 2.0 + 0.08 * Math.sin(t * 6), u.pos.z);
      mark.mesh.rotation.y = frame.clock.elapsedTime * 3;
      mark.mesh.visible = true;

      if (target && isAlive(target)) {
        setLine(
          pool.revealLines[revealIdx],
          u.pos,
          target.pos,
          1.5,
          1.15,
          REVEAL_COLOR,
          0.85,
        );
      } else {
        pool.revealLines[revealIdx].obj.visible = false;
      }
      revealIdx++;
    }

    // 未使用プールを隠す。
    for (let i = shotIdx; i < SHOT_POOL; i++) pool.shots[i].obj.visible = false;
    for (let i = beamIdx; i < BEAM_POOL; i++) pool.beams[i].mesh.visible = false;
    for (let i = revealIdx; i < REVEAL_POOL; i++) {
      pool.revealLines[i].obj.visible = false;
      pool.revealMarks[i].mesh.visible = false;
    }
  });

  return <group ref={anchorRef} />;
}
