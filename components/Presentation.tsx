"use client";

import { useState } from "react";
import { useAppStore } from "@/src/store/appStore";

const STEPS = [
  {
    id: "nucleotides",
    title: "Nucleótidos",
    description:
      "Los nucleótidos son las unidades básicas del ADN. Cada uno tiene tres partes: una base nitrogenada (A, T, C o G), una molécula de azúcar (desoxirribosa) y un grupo fosfato.",
    note: "Ciencia: consenso molecular biológico.",
    camera: "dna" as const,
    packLevel: 0,
  },
  {
    id: "helix",
    title: "Doble Hélice",
    description:
      "Los nucleótidos se unen para formar dos cadenas antiparalelas que se enrollan formando la doble hélice. A siempre se empareja con T (2 enlaces H) y C con G (3 enlaces H).",
    note: "Representación educativa — no simulación atómica exacta.",
    camera: "dna" as const,
    packLevel: 0,
  },
  {
    id: "nucleosome",
    title: "Nucleosoma",
    description:
      "El ADN se enrolla alrededor de proteínas llamadas histonas formando nucleosomas — la primera unidad de compactación. Aquí usamos un modelo simplificado (cilindros).",
    note: "Modelo simplificado. En realidad son 8 histonas por nucleosoma.",
    camera: "chromosome" as const,
    packLevel: 35,
  },
  {
    id: "chromatin",
    title: "Fibra de Cromatina",
    description:
      "Los nucleosomas se organizan en una fibra de cromatina de mayor orden. Aquí se visualiza como una hélice más gruesa (modelo abstracto).",
    note: "Modelo didáctico — la estructura real es más compleja.",
    camera: "chromosome" as const,
    packLevel: 70,
  },
  {
    id: "chromosome",
    title: "Cromosoma",
    description:
      "La cromatina se condensa aún más formando cromosomas visibles durante la división celular. Dos cromátidas hermanas unidas en el centrómero.",
    note: "Representación abstracta del cromosoma.",
    camera: "chromosome" as const,
    packLevel: 95,
  },
  {
    id: "cell",
    title: "Célula",
    description:
      "Los cromosomas están en el núcleo, rodeado por la membrana nuclear y celular. Los organelos llevan a cabo las funciones vitales. Esta vista es una metáfora visual simplificada.",
    note: "Metáfora visual — no representa bioquímica real.",
    camera: "cell" as const,
    packLevel: 95,
  },
  {
    id: "universe",
    title: "Universo (metáfora)",
    description:
      'La "curvatura del espacio" está inspirada en la relatividad general de Einstein. La vida emerge en un universo con leyes físicas precisas. Esta vista es puramente metafórica.',
    note: "⚠️ Metáfora artística. No simulación científica.",
    camera: "universe" as const,
    packLevel: 95,
  },
];

export default function Presentation() {
  const [step, setStep] = useState(0);
  const actions = useAppStore((s) => s.actions);
  const current = STEPS[step]!;

  const applyStep = (idx: number) => {
    const s = STEPS[idx];
    if (!s) return;
    setStep(idx);
    actions.setCameraPreset(s.camera);
    actions.setPackLevel(s.packLevel);
  };

  const close = () => actions.setShowPresentation(false);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#070b14]/95 shadow-soft p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs uppercase tracking-widest text-white/40">Presentación guiada</div>
          <button
            className="text-white/40 hover:text-white/70 text-sm transition"
            onClick={close}
            aria-label="Cerrar presentación"
          >
            ✕
          </button>
        </div>

        {/* Step dots */}
        <div className="flex gap-1.5 mb-5">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "bg-white/80 w-6" : i < step ? "bg-white/40 w-3" : "bg-white/15 w-3"
              }`}
              onClick={() => applyStep(i)}
              aria-label={`Ir al paso ${i + 1}: ${s.title}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-[11px] text-white/40 uppercase tracking-wider mb-1">
          {step + 1} / {STEPS.length}
        </div>
        <h2 className="text-xl font-semibold mb-3">{current.title}</h2>
        <p className="text-white/80 text-sm leading-relaxed mb-4">{current.description}</p>
        <div className="rounded-xl bg-amber-900/10 border border-amber-400/15 px-3 py-2 text-[11px] text-amber-300/80">
          {current.note}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-5">
          <button
            className="flex-1 rounded-xl py-2.5 border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm disabled:opacity-30"
            disabled={step === 0}
            onClick={() => applyStep(step - 1)}
          >
            ← Anterior
          </button>
          {step < STEPS.length - 1 ? (
            <button
              className="flex-1 rounded-xl py-2.5 border border-white/15 bg-white/10 hover:bg-white/15 transition text-sm"
              onClick={() => applyStep(step + 1)}
            >
              Siguiente →
            </button>
          ) : (
            <button
              className="flex-1 rounded-xl py-2.5 border border-emerald-400/20 bg-emerald-500/10 hover:bg-emerald-500/20 transition text-sm"
              onClick={close}
            >
              Finalizar ✓
            </button>
          )}
        </div>

        {/* Final message */}
        {step === STEPS.length - 1 && (
          <div className="mt-4 text-[11px] text-white/50 leading-relaxed border-t border-white/10 pt-3">
            <b>Qué aprendiste:</b> estructura del ADN (doble hélice, A–T/C–G), empaquetamiento progresivo,
            la célula como sistema organizado, y cómo los modelos visuales simplifican la realidad
            para hacerla comprensible. La curvatura y el "vacío" son metáforas artísticas.
          </div>
        )}
      </div>
    </div>
  );
}
