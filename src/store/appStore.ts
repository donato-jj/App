import { create } from "zustand";
import type { Base, CameraPreset, QualityPreset, ReportSnapshot, TabKey } from "@/src/types/app";
import { clamp01 } from "@/src/lib/math";
import { mutateSequence } from "@/src/lib/dna";

type UIState = { activeTab: TabKey; showPresentation: boolean };

type DNAState = {
  pairs: number;
  radius: number;
  pitch: number;
  separation: number;
  rotateSpeed: number;
  breathing: number;
  showLabels: boolean;
  examMode: boolean;
  sequence: string;
};

type PackState = { level: number };
type VoidState = { intensity: number; mode: "field" | "particles"; particleDensity: number };

type EinsteinState = { mass: number; warp: number; scale: number; showGeodesics: boolean };

type DarwinState = {
  mutationRate: number;
  selectionBias: number;
  history: Array<{ atISO: string; index: number; from: Base; to: Base }>;
};

type PerfState = { fps: number; quality: QualityPreset; dpr: number; isMobileHint: boolean };
type SceneState = { cameraPreset: CameraPreset; resetNonce: number };

type StoreState = {
  ui: UIState;
  dna: DNAState;
  pack: PackState;
  voidField: VoidState;
  einstein: EinsteinState;
  darwin: DarwinState;
  perf: PerfState;
  scene: SceneState;

  actions: {
    setActiveTab: (k: TabKey) => void;
    setShowPresentation: (v: boolean) => void;

    setQuality: (q: QualityPreset) => void;
    setFPS: (fps: number) => void;
    setDPR: (dpr: number) => void;
    setMobileHint: (v: boolean) => void;

    setCameraPreset: (p: CameraPreset) => void;
    resetScene: () => void;

    setDNA: (patch: Partial<DNAState>) => void;
    setPackLevel: (v: number) => void;

    setVoid: (patch: Partial<VoidState>) => void;
    setEinstein: (patch: Partial<EinsteinState>) => void;

    setDarwin: (patch: Partial<DarwinState>) => void;
    mutateOnce: () => void;

    buildReport: () => ReportSnapshot;
  };
};

const DEFAULT_SEQUENCE = "ATGCCGATTCGATCGATCGATCGGATCCGATATCG";

export const useAppStore = create<StoreState>((set, get) => ({
  ui: { activeTab: "dna", showPresentation: false },
  dna: {
    pairs: 80,
    radius: 1.2,
    pitch: 0.35,
    separation: 0.18,
    rotateSpeed: 0.25,
    breathing: 0.25,
    showLabels: true,
    examMode: false,
    sequence: DEFAULT_SEQUENCE
  },
  pack: { level: 0 },
  voidField: { intensity: 0.55, mode: "field", particleDensity: 0.6 },
  einstein: { mass: 0.7, warp: 0.8, scale: 1.0, showGeodesics: true },
  darwin: { mutationRate: 0.12, selectionBias: 0.35, history: [] },
  perf: { fps: 60, quality: "auto", dpr: 1.5, isMobileHint: false },
  scene: { cameraPreset: "dna", resetNonce: 0 },

  actions: {
    setActiveTab: (k) => set((s) => ({ ui: { ...s.ui, activeTab: k } })),
    setShowPresentation: (v) => set((s) => ({ ui: { ...s.ui, showPresentation: v } })),

    setQuality: (q) => set((s) => ({ perf: { ...s.perf, quality: q } })),
    setFPS: (fps) => set((s) => ({ perf: { ...s.perf, fps } })),
    setDPR: (dpr) => set((s) => ({ perf: { ...s.perf, dpr } })),
    setMobileHint: (v) => set((s) => ({ perf: { ...s.perf, isMobileHint: v } })),

    setCameraPreset: (p) => set((s) => ({ scene: { ...s.scene, cameraPreset: p } })),
    resetScene: () => set((s) => ({ scene: { ...s.scene, resetNonce: s.scene.resetNonce + 1 } })),

    setDNA: (patch) => set((s) => ({ dna: { ...s.dna, ...patch } })),
    setPackLevel: (v) => set(() => ({ pack: { level: Math.max(0, Math.min(100, v)) } })),

    setVoid: (patch) => set((s) => ({ voidField: { ...s.voidField, ...patch } })),
    setEinstein: (patch) => set((s) => ({ einstein: { ...s.einstein, ...patch } })),
    setDarwin: (patch) => set((s) => ({ darwin: { ...s.darwin, ...patch } })),

    mutateOnce: () => {
      const { dna } = get();
      const res = mutateSequence(dna.sequence);
      set((s) => ({
        dna: { ...s.dna, sequence: res.sequence },
        darwin: {
          ...s.darwin,
          history: [{ atISO: new Date().toISOString(), index: res.index, from: res.from, to: res.to }, ...s.darwin.history].slice(0, 50)
        }
      }));
    },

    buildReport: () => {
      const s = get();
      return {
        timestampISO: new Date().toISOString(),
        quality: s.perf.quality,
        cameraPreset: s.scene.cameraPreset,
        dna: { ...s.dna },
        pack: { ...s.pack },
        voidField: { ...s.voidField },
        einstein: { ...s.einstein },
        darwin: {
          mutationRate: clamp01(s.darwin.mutationRate),
          selectionBias: clamp01(s.darwin.selectionBias),
          history: s.darwin.history
        },
        notes: {
          scientific: [
            "ADN: doble hélice, pares A–T y C–G, backbone (representación), idea general de empaquetamiento.",
            "Etiquetado y secuencia con objetivo didáctico."
          ],
          metaphor: [
            "“Genoma del vacío”: metáfora visual de fluctuaciones (ruido procedimental).",
            "“Einstein”: curvatura/geodésicas como modelo inspirado simplificado."
          ],
          limitations: ["No simulación molecular ni relativista exacta; es un sistema educativo."]
        }
      };
    }
  }
}));
