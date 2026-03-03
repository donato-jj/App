"use client";

import { useAppStore } from "@/src/store/appStore";
import type { CameraPreset, QualityPreset } from "@/src/types/app";

export default function TopBar() {
  const quality = useAppStore((s) => s.perf.quality);
  const fps = useAppStore((s) => s.perf.fps);
  const cameraPreset = useAppStore((s) => s.scene.cameraPreset);
  const actions = useAppStore((s) => s.actions);

  const handleCapture = () => {
    const win = window as Window & { __captureScene?: () => void };
    win.__captureScene?.();
  };

  const handleExportReport = () => {
    const report = actions.buildReport();
    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fpsColor =
    fps >= 55 ? "text-emerald-400" : fps >= 35 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="h-14 flex items-center gap-3 px-4 border-b border-white/10 bg-black/30 backdrop-blur-sm overflow-x-auto shrink-0">
      {/* Camera preset */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[11px] text-white/50">Vista:</span>
        {(
          [
            { value: "dna", label: "ADN" },
            { value: "chromosome", label: "Crom." },
            { value: "cell", label: "Célula" },
            { value: "universe", label: "Universo" },
          ] as { value: CameraPreset; label: string }[]
        ).map((p) => (
          <button
            key={p.value}
            className={`rounded-lg px-2.5 py-1 text-[11px] border transition ${
              cameraPreset === p.value
                ? "bg-white/15 border-white/20 text-white"
                : "bg-black/20 border-white/10 text-white/60 hover:bg-black/30"
            }`}
            onClick={() => actions.setCameraPreset(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="h-4 w-px bg-white/10 shrink-0" />

      {/* Quality */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[11px] text-white/50">Calidad:</span>
        {(
          [
            { value: "auto", label: "Auto" },
            { value: "low", label: "Low" },
            { value: "high", label: "High" },
          ] as { value: QualityPreset; label: string }[]
        ).map((q) => (
          <button
            key={q.value}
            className={`rounded-lg px-2.5 py-1 text-[11px] border transition ${
              quality === q.value
                ? "bg-white/15 border-white/20 text-white"
                : "bg-black/20 border-white/10 text-white/60 hover:bg-black/30"
            }`}
            onClick={() => actions.setQuality(q.value)}
          >
            {q.label}
          </button>
        ))}
      </div>

      <div className="h-4 w-px bg-white/10 shrink-0" />

      {/* FPS */}
      <div className={`text-[11px] font-mono tabular-nums shrink-0 ${fpsColor}`}>
        {fps} fps
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <button
        className="rounded-lg px-3 py-1.5 text-[11px] border border-white/10 bg-black/20 hover:bg-black/30 transition shrink-0"
        onClick={() => actions.resetScene()}
      >
        Reset
      </button>
      <button
        className="rounded-lg px-3 py-1.5 text-[11px] border border-white/10 bg-black/20 hover:bg-black/30 transition shrink-0"
        onClick={handleCapture}
        title="Capturar pantalla"
      >
        📷 PNG
      </button>
      <button
        className="rounded-lg px-3 py-1.5 text-[11px] border border-indigo-400/20 bg-indigo-500/10 hover:bg-indigo-500/20 transition shrink-0"
        onClick={handleExportReport}
        title="Exportar reporte académico JSON"
      >
        Reporte JSON
      </button>
    </div>
  );
}
