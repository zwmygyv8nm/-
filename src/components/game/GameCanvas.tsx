"use client";

import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import type * as THREE from "three";
import { getSim, useGameStore } from "@/lib/game/store";
import { EffectsLayer } from "./EffectsLayer";
import { Field } from "./Field";
import { Obstacles } from "./Obstacles";
import { SimulationDriver } from "./SimulationDriver";
import { UnitsLayer } from "./UnitsLayer";

// デバッグ時のみ true にする(MVPではカメラ操作なし)。
const DEBUG_ORBIT_CONTROLS = false;

const CAMERA_POSITION: [number, number, number] = [12, 16, 12];

/** 斜め上から見下ろす固定カメラ。ズームだけ画面サイズに合わせてフィットさせる。 */
function CameraRig() {
  const cameraRef = useRef<THREE.OrthographicCamera>(null);
  const size = useThree((s) => s.size);

  useLayoutEffect(() => {
    const camera = cameraRef.current;
    if (!camera) return;
    camera.zoom = Math.min(size.width / 21, size.height / 16);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [size]);

  return (
    <OrthographicCamera
      ref={cameraRef}
      makeDefault
      position={CAMERA_POSITION}
      near={0.1}
      far={100}
    />
  );
}

/**
 * 一次関数の方向指定用クリック判定プレーン。エイム中のみマウントされ、
 * クリック地点からエイム中ユニット→クリック点の方向を計算して発動指示を積む。
 */
function AimClickPlane() {
  const aimingUnitId = useGameStore((s) => s.aimingUnitId);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    const { aimingUnitId: aiming, enqueueSkill, setAiming } =
      useGameStore.getState();
    if (!aiming) return;
    e.stopPropagation();
    const unit = getSim().units.find((u) => u.id === aiming);
    if (!unit) {
      setAiming(null);
      return;
    }
    const dir = { x: e.point.x - unit.pos.x, z: e.point.z - unit.pos.z };
    if (Math.hypot(dir.x, dir.z) < 1e-3) return;
    enqueueSkill(aiming, dir);
    setAiming(null);
  };

  if (!aimingUnitId) return null;
  return (
    <mesh
      rotation-x={-Math.PI / 2}
      position={[0, 0.004, 0]}
      onPointerDown={handlePointerDown}
    >
      <planeGeometry args={[60, 60]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

export function GameCanvas() {
  return (
    <Canvas dpr={[1, 2]} gl={{ antialias: true }}>
      <color attach="background" args={["#101725"]} />
      <CameraRig />
      {DEBUG_ORBIT_CONTROLS && <OrbitControls />}

      <ambientLight intensity={0.85} />
      <directionalLight position={[6, 12, 4]} intensity={1.2} />

      <Field />
      <Obstacles />
      <UnitsLayer />
      <EffectsLayer />
      <AimClickPlane />
      <SimulationDriver />
    </Canvas>
  );
}
