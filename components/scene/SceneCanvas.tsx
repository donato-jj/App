"use client";

import { Suspense, useCallback, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Stats } from "@react-three/drei";
import { useAppStore } from "@/src/store/appStore";
import { isMobileDeviceHint, chooseDPR } from "@/src/lib/perf";
import { downloadDataUrl } from "@/src/lib/exporters";
import DNAHelix from "./DNAHelix";
import ChromatinPack from "./ChromatinPack";
import VoidField from "./VoidField";
import EinsteinSpace from "./EinsteinSpace";
import CellAssembly from "./CellAssembly";
import type { CameraPreset } from "@/src/types/app";

const CAMERA_POSITIONS: Record<CameraPreset, [number, number, number]> = {
  dna: [0, 0, 12],
  chromosome: [0, 0, 20],
  cell: [0, 0, 30],
  universe: [0, 0, 45]
};

function SceneInner() {
  const quality = useAppStore((s) => s.perf.quality);
  const fps = useAppStore((s) => s.perf.fps);
  const mobileHint = useAppStore((s) => s.perf.isMobileHint);
  const cameraPreset = useAppStore((s) => s.scene.cameraPreset);
  const resetNonce = useAppStore((s) => s.scene.resetNonce);
  const packLevel = useAppStore((s) => s.pack.level);
  const setFPS = useAppStore((s) => s.actions.setFPS);

  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (controlsRef.current) {
      const [x, y, z] = CAMERA_POSITIONS[cameraPreset];
      controlsRef.current.object.position.set(x, y, z);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraPreset, resetNonce]);

  const dpr = chooseDPR(quality, fps, mobileHint);

  return (
    <Canvas
      dpr={Math.min(dpr, typeof window !== "undefined" ? window.devicePixelRatio : 2)}
      camera={{ position: CAMERA_POSITIONS[cameraPreset], fov: 55, near: 0.1, far: 500 }}
      gl={{ preserveDrawingBuffer: true, antialias: quality !== "low" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x060810, 1);
      }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 5]} intensity={0.9} castShadow={false} />
        <pointLight position={[-6, -4, 4]} intensity={0.5} color="#7c3aed" />
        <pointLight position={[6, 4, -4]} intensity={0.4} color="#0891b2" />

        <EinsteinSpace />
        <VoidField />

        {packLevel < 85 ? <DNAHelix /> : null}
        <ChromatinPack />

        {packLevel < 20 ? <CellAssembly /> : null}

        <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.08} minDistance={2} maxDistance={120} />

        {quality === "high" ? <Stats /> : null}
      </Suspense>
    </Canvas>
  );
}

export default function SceneCanvas() {
  const setMobileHint = useAppStore((s) => s.actions.setMobileHint);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileHint(isMobileDeviceHint());
  }, [setMobileHint]);

  const handleCapture = useCallback(() => {
    const canvas = canvasContainerRef.current?.querySelector("canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    downloadDataUrl(`adn-universo-${Date.now()}.png`, dataUrl);
  }, []);

  useEffect(() => {
    (window as any).__sceneCapture = handleCapture;
    return () => {
      delete (window as any).__sceneCapture;
    };
  }, [handleCapture]);

  return (
    <div ref={canvasContainerRef} className="w-full h-full bg-[#060810]">
      <SceneInner />
    </div>
  );
}
