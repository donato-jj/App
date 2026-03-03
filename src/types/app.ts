export type QualityPreset = "auto" | "low" | "high";
export type CameraPreset = "dna" | "chromosome" | "cell" | "universe";
export type TabKey = "dna" | "pack" | "void" | "einstein" | "darwin" | "academic" | "method";
export type Base = "A" | "T" | "C" | "G";

export type ReportSnapshot = {
  timestampISO: string;
  quality: QualityPreset;
  cameraPreset: CameraPreset;
  dna: {
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
  pack: { level: number };
  voidField: { intensity: number; mode: "field" | "particles"; particleDensity: number };
  einstein: { mass: number; warp: number; scale: number; showGeodesics: boolean };
  darwin: {
    mutationRate: number;
    selectionBias: number;
    history: Array<{ atISO: string; index: number; from: Base; to: Base }>;
  };
  notes: {
    scientific: string[];
    metaphor: string[];
    limitations: string[];
  };
};
