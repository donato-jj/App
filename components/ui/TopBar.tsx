"use client";
import { useAppStore } from "@/src/store/appStore";
import { Select } from "./Select";
import type { CameraPreset, QualityPreset } from "@/src/types/app";
import { downloadTextFile } from "@/src/lib/exporters";

export default function TopBar() {
  const cameraPreset = useAppStore((s) => s.scene.cameraPreset);
  const quality = useAppStore((s) => s.perf.quality);
  const fps = useAppStore((s) => s.perf.fps);
  const actions = useAppStore((s) => s.actions);

  const fpsColor = fps >= 55 ? "#4ade80" : fps >= 40 ? "#facc15" : "#f87171";

  const handleReport = () => {
    const report = actions.buildReport();
    downloadTextFile("reporte-academico.json", JSON.stringify(report, null, 2));
  };

  return (
    <div className="h-14 w-full flex items-center px-4 gap-3 border-b border-white/10 bg-black/40 backdrop-blur-sm z-10">
      <div className="text-sm font-semibold whitespace-nowrap mr-2 hidden sm:block">ADN 3D</div>

      <Select<CameraPreset>
        label=""
        value={cameraPreset}
        options={[
          { value: "dna", label: "Vista: ADN" },
          { value: "chromosome", label: "Vista: Cromosoma" },
          { value: "cell", label: "Vista: Célula" },
          { value: "universe", label: "Vista: Universo" },
        ]}
        onChange={(v) => actions.setCameraPreset(v)}
      />

      <Select<QualityPreset>
        label=""
        value={quality}
        options={[
          { value: "auto", label: "Cal: Auto" },
          { value: "low", label: "Cal: Low" },
          { value: "high", label: "Cal: High" },
        ]}
        onChange={(v) => actions.setQuality(v)}
      />

      <div
        className="text-xs tabular-nums font-mono px-2 py-1 rounded-lg bg-black/30 border border-white/10 hidden sm:block"
        style={{ color: fpsColor }}
      >
        {fps} FPS
      </div>

      <div className="flex-1" />

      <button
        className="rounded-xl px-3 py-1.5 text-xs bg-white/10 hover:bg-white/15 border border-white/10 transition"
        onClick={() => actions.resetScene()}
      >
        Reset
      </button>

      <button
        className="rounded-xl px-3 py-1.5 text-xs bg-white/10 hover:bg-white/15 border border-white/10 transition"
        onClick={() => (window as any).__captureScene?.()}
      >
        Capturar
      </button>

      <button
        className="rounded-xl px-3 py-1.5 text-xs bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/20 transition"
        onClick={handleReport}
      >
        Reporte
      </button>
    </div>
  );
}
