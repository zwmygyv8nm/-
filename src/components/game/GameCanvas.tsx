"use client";

import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import type * as THREE from "three";
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
      <SimulationDriver />
    </Canvas>
  );
}
