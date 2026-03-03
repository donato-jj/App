"use client";
import { useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useAppStore } from "@/src/store/appStore";
import { chooseDPR } from "@/src/lib/perf";
import { downloadDataUrl } from "@/src/lib/exporters.js";
import DNAHelix from "./DNAHelix";
import ChromatinPack from "./ChromatinPack";
import VoidField from "./VoidField";
import EinsteinSpace from "./EinsteinSpace";
import CellAssembly from "./CellAssembly";

function FPSTracker() {
  const setFPS = useAppStore((s) => s.actions.setFPS);
  const last = useRef(performance.now());
  const frames = useRef(0);
  useFrame(() => {
    frames.current++;
    const now = performance.now();
    if (now - last.current >= 1000) {
      setFPS(Math.round((frames.current * 1000) / (now - last.current)));
      frames.current = 0;
      last.current = now;
    }
  });
  return null;
}

const CAMERA_POSITIONS: Record<string, [number, number, number]> = {
  dna: [0, 2, 8],
  chromosome: [0, 5, 15],
  cell: [0, 8, 22],
  universe: [0, 0, 35],
};

function CameraController() {
  const cameraPreset = useAppStore((s) => s.scene.cameraPreset);
  const { camera } = useThree();
  useEffect(() => {
    const [x, y, z] = CAMERA_POSITIONS[cameraPreset] ?? [0, 2, 8];
    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
  }, [cameraPreset, camera]);
  return null;
}

function ScreenshotBridge() {
  const { gl } = useThree();
  useEffect(() => {
    (window as any).__captureScene = () => {
      const dataUrl = gl.domElement.toDataURL("image/png");
      downloadDataUrl("escena-academica.png", dataUrl);
    };
    return () => {
      delete (window as any).__captureScene;
    };
  }, [gl]);
  return null;
}

function SceneContent() {
  const cameraPreset = useAppStore((s) => s.scene.cameraPreset);
  const packLevel = useAppStore((s) => s.pack.level);
  const resetNonce = useAppStore((s) => s.scene.resetNonce);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, [resetNonce]);

  return (
    <>
      <FPSTracker />
      <CameraController />
      <ScreenshotBridge />
      <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.08} />
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade />
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -5, -5]} intensity={0.3} color="#8b5cf6" />
      <Suspense fallback={null}>
        <VoidField />
        {cameraPreset === "universe" && <EinsteinSpace />}
        {cameraPreset === "cell" && <CellAssembly />}
        {packLevel > 20 && <ChromatinPack />}
        <DNAHelix />
      </Suspense>
    </>
  );
}

export default function SceneCanvas() {
  const quality = useAppStore((s) => s.perf.quality);
  const fps = useAppStore((s) => s.perf.fps);
  const isMobileHint = useAppStore((s) => s.perf.isMobileHint);
  const dpr = chooseDPR(quality, fps, isMobileHint);

  return (
    <div className="w-full h-full">
      <Canvas
        dpr={dpr}
        camera={{ fov: 55, near: 0.1, far: 1000 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}
