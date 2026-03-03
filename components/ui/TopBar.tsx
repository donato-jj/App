"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/src/store/appStore";
import { downloadTextFile } from "@/src/lib/exporters";
import { Select } from "./Select";
import type { CameraPreset, QualityPreset } from "@/src/types/app";

const CAMERA_OPTIONS: Array<{ value: CameraPreset; label: string }> = [
  { value: "dna", label: "Vista: ADN" },
  { value: "chromosome", label: "Vista: Cromosoma" },
  { value: "cell", label: "Vista: Célula" },
  { value: "universe", label: "Vista: Universo" }
];

const QUALITY_OPTIONS: Array<{ value: QualityPreset; label: string }> = [
  { value: "auto", label: "Calidad: Auto" },
  { value: "low", label: "Calidad: Low" },
  { value: "high", label: "Calidad: High" }
];

export default function TopBar() {
  const quality = useAppStore((s) => s.perf.quality);
  const fps = useAppStore((s) => s.perf.fps);
  const cameraPreset = useAppStore((s) => s.scene.cameraPreset);
  const { setQuality, setCameraPreset, resetScene, buildReport } = useAppStore((s) => s.actions);

  const fpsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let lastTime = performance.now();
    let frames = 0;
    let rafId: number;
    function measure() {
      frames++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        const fps = Math.round((frames * 1000) / (now - lastTime));
        if (fpsRef.current) fpsRef.current.textContent = `${fps} fps`;
        useAppStore.getState().actions.setFPS(fps);
        frames = 0;
        lastTime = now;
      }
      rafId = requestAnimationFrame(measure);
    }
    rafId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleCapture = () => {
    if (typeof window !== "undefined" && (window as any).__sceneCapture) {
      (window as any).__sceneCapture();
    }
  };

  const handleReport = () => {
    const report = buildReport();
    downloadTextFile(
      `reporte-academico-${Date.now()}.json`,
      JSON.stringify(report, null, 2)
    );
  };

  return (
    <div className="h-14 w-full flex items-center gap-2 px-3 border-b border-white/10 bg-black/40 backdrop-blur-sm overflow-x-auto shrink-0">
      <span className="text-xs font-semibold text-white/80 whitespace-nowrap mr-1">ADN·Universo</span>

      <div className="w-36 shrink-0">
        <Select
          label=""
          value={cameraPreset}
          options={CAMERA_OPTIONS}
          onChange={setCameraPreset}
        />
      </div>

      <div className="w-36 shrink-0">
        <Select
          label=""
          value={quality}
          options={QUALITY_OPTIONS}
          onChange={setQuality}
        />
      </div>

      <span
        ref={fpsRef}
        className="text-[11px] text-white/50 tabular-nums whitespace-nowrap w-14"
      >
        — fps
      </span>

      <button
        className="rounded-xl px-3 py-1.5 text-xs bg-white/10 hover:bg-white/15 border border-white/10 transition whitespace-nowrap"
        onClick={resetScene}
        title="Resetear escena"
      >
        Reset
      </button>

      <button
        className="rounded-xl px-3 py-1.5 text-xs bg-white/10 hover:bg-white/15 border border-white/10 transition whitespace-nowrap"
        onClick={handleCapture}
        title="Capturar imagen PNG"
      >
        📷 PNG
      </button>

      <button
        className="rounded-xl px-3 py-1.5 text-xs bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/20 transition whitespace-nowrap"
        onClick={handleReport}
        title="Exportar reporte académico JSON"
      >
        ⬇ Reporte
      </button>
    </div>
  );
}
