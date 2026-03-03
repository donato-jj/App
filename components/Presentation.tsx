"use client";

import { useState } from "react";
import { useAppStore } from "@/src/store/appStore";

const STEPS = [
  {
    title: "Nucleótidos: las letras del genoma",
    body: "El ADN está formado por cuatro nucleótidos: A (adenina), T (timina), C (citosina) y G (guanina). Cada nucleótido tiene una base nitrogenada, un azúcar (desoxirribosa) y un fosfato.",
    action: { tab: "dna" as const, pack: 0, camera: "dna" as const },
    note: "Científico: estructura real del ADN."
  },
  {
    title: "Doble hélice y emparejamiento",
    body: "Las dos cadenas del ADN se enrollan formando una doble hélice. Las bases se emparejan específicamente: A con T (2 puentes H) y C con G (3 puentes H). Esta complementariedad permite la replicación.",
    action: { tab: "dna" as const, pack: 0, camera: "dna" as const },
    note: "Científico: regla de Chargaff / Watson-Crick."
  },
  {
    title: "Nucleosomas: primer empaquetamiento",
    body: "El ADN se enrolla alrededor de proteínas llamadas histonas para formar nucleosomas. Esta estructura permite compactar ~2 metros de ADN en un núcleo de ~10 µm.",
    action: { tab: "pack" as const, pack: 35, camera: "dna" as const },
    note: "Científico: empaquetamiento real (simplificado visualmente)."
  },
  {
    title: "Fibra de cromatina",
    body: "Los nucleosomas se pliegan en una fibra de 30 nm (modelo aún debatido). Aquí se muestra una abstracción visual.",
    action: { tab: "pack" as const, pack: 68, camera: "chromosome" as const },
    note: "Simplificado: el modelo de fibra de 30 nm es objeto de debate científico."
  },
  {
    title: "Cromosoma",
    body: "En la división celular, la cromatina se condensa formando cromosomas visibles. Los humanos tienen 46 cromosomas (23 pares).",
    action: { tab: "pack" as const, pack: 95, camera: "chromosome" as const },
    note: "Científico: representación abstracta del cromosoma."
  },
  {
    title: "Célula: contexto organizativo",
    body: "El ADN vive en el núcleo de la célula, rodeado por membrana, organelos y citoplasma. Esta vista es una metáfora visual simplificada de la organización celular.",
    action: { tab: "dna" as const, pack: 0, camera: "cell" as const },
    note: "Metáfora / modelo didáctico: no bioquímica exacta."
  },
  {
    title: "Universo y modelos: perspectiva",
    body: "La física moderna describe el espacio-tiempo curvo por la masa (Einstein). Los modelos científicos simplifican la realidad para comprenderla. El 'genoma del vacío' es una metáfora artística.",
    action: { tab: "einstein" as const, pack: 0, camera: "universe" as const },
    note: "Metáfora: curvatura visual inspirada en relatividad general."
  },
  {
    title: "Ciencia y modelos",
    body: "Lo que aprendiste: estructura del ADN (hélice, emparejamiento A-T / C-G), empaquetamiento (nucleosoma→cromosoma), noción de modelos simplificados y la diferencia entre representación científica y metáfora.",
    action: { tab: "academic" as const, pack: 0, camera: "dna" as const },
    note: "Conclusión académica."
  }
];

export default function Presentation() {
  const [step, setStep] = useState(0);
  const { setActiveTab, setPackLevel, setCameraPreset, setShowPresentation } = useAppStore(
    (s) => s.actions
  );

  const current = STEPS[step]!;

  const applyStep = (s: typeof STEPS[0]) => {
    setActiveTab(s.action.tab);
    setPackLevel(s.action.pack);
    setCameraPreset(s.action.camera);
  };

  const goTo = (idx: number) => {
    setStep(idx);
    applyStep(STEPS[idx]!);
  };

  const next = () => goTo(Math.min(step + 1, STEPS.length - 1));
  const prev = () => goTo(Math.max(step - 1, 0));
  const close = () => setShowPresentation(false);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-6 px-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-2xl rounded-3xl border border-white/15 bg-black/70 backdrop-blur-xl shadow-soft p-6">
        {/* Progress dots */}
        <div className="flex gap-1.5 mb-4">
          {STEPS.map((_, i) => (
            <button
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-6 bg-white/80" : "w-1.5 bg-white/25"
              }`}
              onClick={() => goTo(i)}
              aria-label={`Paso ${i + 1}`}
            />
          ))}
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="text-xs text-white/40 uppercase tracking-widest mb-1">
              Paso {step + 1} / {STEPS.length}
            </div>
            <h2 className="text-lg font-semibold leading-snug">{current.title}</h2>
            <p className="mt-2 text-sm text-white/75 leading-relaxed">{current.body}</p>
            <div className="mt-2 text-[11px] text-indigo-300/70 italic">{current.note}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-5">
          <button
            className="rounded-xl px-4 py-2 text-sm bg-white/10 hover:bg-white/15 border border-white/10 transition disabled:opacity-30"
            onClick={prev}
            disabled={step === 0}
          >
            ← Anterior
          </button>
          <button
            className="rounded-xl px-4 py-2 text-sm bg-white/10 hover:bg-white/15 border border-white/10 transition disabled:opacity-30"
            onClick={next}
            disabled={step === STEPS.length - 1}
          >
            Siguiente →
          </button>
          <button
            className="ml-auto rounded-xl px-4 py-2 text-sm bg-red-500/10 hover:bg-red-500/20 border border-red-400/20 transition"
            onClick={close}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
