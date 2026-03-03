"use client";
import { useState } from "react";
import { useAppStore } from "@/src/store/appStore";

const STEPS = [
  {
    title: "1. Nucleótidos",
    description: "Los nucleótidos son las unidades básicas del ADN: base nitrogenada + desoxirribosa + fosfato.",
    observe: "Observá las esferas coloreadas: A (azul), T (violeta), C (verde), G (amarillo).",
    scienceNote: "Científico: estructura básica documentada desde Watson & Crick (1953).",
    metaphorNote: null,
    action: () => {
      const a = useAppStore.getState().actions;
      a.setCameraPreset("dna");
      a.setPackLevel(0);
      a.setDNA({ showLabels: true, pairs: 40 });
    }
  },
  {
    title: "2. Doble Hélice",
    description: "El ADN forma una doble hélice antiparalela. Las bases se aparean: A con T, C con G.",
    observe: "Notá los dos 'rieles' (backbone) y los peldaños (pares de bases).",
    scienceNote: "Científico: la hélice B tiene ~10 pb por vuelta, paso de 3.4 nm.",
    metaphorNote: "Modelo: radio y pitch simplificados para visualización.",
    action: () => {
      const a = useAppStore.getState().actions;
      a.setCameraPreset("dna");
      a.setPackLevel(0);
      a.setDNA({ showLabels: true, pairs: 80 });
    }
  },
  {
    title: "3. Nucleosoma",
    description: "~147 pares de bases se enrollan alrededor de un octámero de histonas formando el nucleosoma.",
    observe: "Las esferas moradas representan nucleosomas. El ADN 'desaparece' gradualmente.",
    scienceNote: "Científico: nucleosoma = unidad fundamental de compactación (Luger et al., 1997).",
    metaphorNote: "Modelo: forma simplificada, sin detalle atómico.",
    action: () => {
      const a = useAppStore.getState().actions;
      a.setCameraPreset("chromosome");
      a.setPackLevel(35);
    }
  },
  {
    title: "4. Fibra de Cromatina",
    description: "Los nucleosomas se compactan en una fibra solenoide de ~30 nm de diámetro.",
    observe: "La espiral verde representa la fibra solenoide.",
    scienceNote: "Científico: compactación ~6× respecto a la cadena de nucleosomas.",
    metaphorNote: "Modelo: geometría helicoidal procedimental.",
    action: () => {
      const a = useAppStore.getState().actions;
      a.setCameraPreset("chromosome");
      a.setPackLevel(65);
    }
  },
  {
    title: "5. Cromosoma",
    description: "La compactación máxima da lugar al cromosoma metafásico, visible en mitosis.",
    observe: "Las dos 'manchas' rosas son las cromátidas hermanas del cromosoma.",
    scienceNote: "Científico: compactación ~10,000× respecto al ADN extendido.",
    metaphorNote: "Modelo: forma X estilizada; cromosomas reales tienen morfología específica por especie.",
    action: () => {
      const a = useAppStore.getState().actions;
      a.setCameraPreset("chromosome");
      a.setPackLevel(95);
    }
  },
  {
    title: "6. Célula",
    description: "El cromosoma está contenido en el núcleo de la célula, rodeado por la membrana celular.",
    observe: "Esfera semitransparente = membrana. Esfera interna = núcleo. Partículas = citoplasma abstracto.",
    scienceNote: "Científico: concepto de compartimentalización celular.",
    metaphorNote: "Modelo: forma esférica genérica, organelos no posicionados con precisión.",
    action: () => {
      const a = useAppStore.getState().actions;
      a.setCameraPreset("cell");
    }
  },
  {
    title: "7. Universo (metáfora)",
    description: "El universo se curva por la masa (modelo didáctico inspirado en Einstein). El 'vacío' pulsa con fluctuaciones procedurales.",
    observe: "La malla deformada bajo la escena. Las geodésicas son líneas que se curvan por el 'campo de masa'.",
    scienceNote: null,
    metaphorNote: "⚠️ Metáfora declarada: la curvatura y el 'vacío' son modelos visuales artísticos, no simulaciones físicas exactas.",
    action: () => {
      const a = useAppStore.getState().actions;
      a.setCameraPreset("universe");
    }
  },
];

export default function Presentation() {
  const [step, setStep] = useState(0);
  const setShowPresentation = useAppStore((s) => s.actions.setShowPresentation);
  const current = STEPS[step]!;

  const go = (idx: number) => {
    const s = STEPS[idx];
    if (s) {
      s.action();
      setStep(idx);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-black/80 backdrop-blur-md p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="text-lg font-semibold">{current.title}</div>
          <button
            className="text-white/50 hover:text-white/80 text-xl leading-none"
            onClick={() => setShowPresentation(false)}
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-white/80 leading-relaxed mb-3">{current.description}</p>

        <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 mb-3 text-[12px] text-white/70">
          <b className="text-white/90">Observá:</b> {current.observe}
        </div>

        {current.scienceNote && (
          <div className="bg-sky-500/10 border border-sky-400/15 rounded-xl px-3 py-2 mb-2 text-[11px] text-sky-200">
            🔬 {current.scienceNote}
          </div>
        )}

        {current.metaphorNote && (
          <div className="bg-amber-500/10 border border-amber-400/15 rounded-xl px-3 py-2 mb-2 text-[11px] text-amber-200">
            🎨 {current.metaphorNote}
          </div>
        )}

        <div className="flex items-center justify-between mt-5">
          <button
            className="rounded-xl px-4 py-2 text-sm bg-white/10 hover:bg-white/15 border border-white/10 transition disabled:opacity-30"
            disabled={step === 0}
            onClick={() => go(step - 1)}
          >
            ← Anterior
          </button>

          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                className={`w-2 h-2 rounded-full transition ${i === step ? "bg-white" : "bg-white/25 hover:bg-white/40"}`}
                onClick={() => go(i)}
              />
            ))}
          </div>

          {step < STEPS.length - 1 ? (
            <button
              className="rounded-xl px-4 py-2 text-sm bg-indigo-500/25 hover:bg-indigo-500/35 border border-indigo-400/20 transition"
              onClick={() => go(step + 1)}
            >
              Siguiente →
            </button>
          ) : (
            <button
              className="rounded-xl px-4 py-2 text-sm bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/20 transition"
              onClick={() => setShowPresentation(false)}
            >
              Finalizar ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
