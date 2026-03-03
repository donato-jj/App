"use client";

import { Suspense, useEffect, useRef, useCallback, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useAppStore } from "@/src/store/appStore";
import { isMobileDeviceHint, chooseDPR } from "@/src/lib/perf";
import DNAHelix from "./DNAHelix";
import ChromatinPack from "./ChromatinPack";
import VoidField from "./VoidField";
import EinsteinSpace from "./EinsteinSpace";
import CellAssembly from "./CellAssembly";

/* ─── Camera controller ─── */
function CameraController() {
  const { camera } = useThree();
  const preset = useAppStore((s) => s.scene.cameraPreset);
  const nonce = useAppStore((s) => s.scene.resetNonce);

  useEffect(() => {
    const positions: Record<string, [number, number, number]> = {
      dna: [0, 0, 12],
      chromosome: [0, 10, 25],
      cell: [0, 0, 35],
      universe: [0, 5, 55],
    };
    const [x, y, z] = positions[preset] ?? [0, 0, 12];
    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
  }, [preset, nonce, camera]);

  return null;
}

/* ─── FPS tracker ─── */
function FPSTracker() {
  const setFPS = useAppStore((s) => s.actions.setFPS);
  const setDPR = useAppStore((s) => s.actions.setDPR);
  const { gl } = useThree();
  const quality = useAppStore((s) => s.perf.quality);
  const fps = useAppStore((s) => s.perf.fps);
  const isMob = useAppStore((s) => s.perf.isMobileHint);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useFrame(() => {
    frameCount.current++;
    const now = performance.now();
    if (now - lastTime.current >= 1000) {
      const measured = Math.round((frameCount.current * 1000) / (now - lastTime.current));
      setFPS(measured);
      frameCount.current = 0;
      lastTime.current = now;
      const newDPR = chooseDPR(quality, measured, isMob);
      gl.setPixelRatio(newDPR);
      setDPR(newDPR);
    }
  });

  return null;
}

/* ─── WebGL check fallback ─── */
function WebGLFallback({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full flex items-center justify-center text-white/60">
      <div className="text-center p-8">
        <div className="text-4xl mb-4">⚠️</div>
        <div className="text-lg font-semibold">WebGL no disponible</div>
        <div className="text-sm mt-2 max-w-xs">
          Tu navegador no soporta WebGL. Intentá con Chrome, Firefox o Safari actualizados.
        </div>
      </div>
    </div>
  );
}

/* ─── Scene content ─── */
function SceneContent() {
  const pack = useAppStore((s) => s.pack.level);
  const showDNA = pack < 60;
  const showChromatin = true;
  const showVoid = true;
  const showEinstein = true;
  const showCell = true;

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow={false} />
      <pointLight position={[-8, -5, -8]} intensity={0.3} color="#4433ff" />
      {showVoid && <VoidField />}
      {showEinstein && <EinsteinSpace />}
      {showDNA && <DNAHelix />}
      {showChromatin && <ChromatinPack />}
      {showCell && <CellAssembly />}
    </>
  );
}

/* ─── Main canvas ─── */
export default function SceneCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const setMobileHint = useAppStore((s) => s.actions.setMobileHint);
  const quality = useAppStore((s) => s.perf.quality);
  const isMob = useAppStore((s) => s.perf.isMobileHint);

  useEffect(() => {
    const mob = isMobileDeviceHint();
    setMobileHint(mob);
  }, [setMobileHint]);

  const initialDPR = quality === "low" ? 1 : quality === "high" ? 2 : isMob ? 1 : 1.5;

  // Screenshot handler exposed via store action (captured in TopBar)
  const handleScreenshot = useCallback(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `adn-universo-${Date.now()}.png`;
    a.click();
  }, []);

  useEffect(() => {
    // Expose screenshot function globally so TopBar can call it
    (window as Window & { __captureScene?: () => void }).__captureScene = handleScreenshot;
    return () => {
      delete (window as Window & { __captureScene?: () => void }).__captureScene;
    };
  }, [handleScreenshot]);

  const [webglOk, setWebglOk] = useState(true);

  if (!webglOk) {
    return <WebGLFallback>{null}</WebGLFallback>;
  }

  return (
    <div className="h-full w-full">
      <Canvas
        ref={canvasRef}
        dpr={initialDPR}
        gl={{
          antialias: !isMob,
          powerPreference: "high-performance",
          preserveDrawingBuffer: true, // needed for screenshot
        }}
        onCreated={({ gl }) => {
          try {
            const ext = gl.getContext().getExtension("WEBGL_lose_context");
            if (!gl.getContext()) setWebglOk(false);
            void ext;
          } catch {
            // ignore
          }
        }}
        shadows={false}
        frameloop="always"
      >
        <PerspectiveCamera makeDefault fov={60} near={0.1} far={500} position={[0, 0, 12]} />
        <CameraController />
        <FPSTracker />
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={200}
          minDistance={1}
          dampingFactor={0.08}
          enableDamping={true}
        />
      </Canvas>
    </div>
  );
}
