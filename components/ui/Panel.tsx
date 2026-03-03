"use client";

import { useAppStore } from "@/src/store/appStore";
import { Tabs } from "./Tabs";
import { Slider } from "./Slider";
import { Toggle } from "./Toggle";
import { Select } from "./Select";
import type { TabKey } from "@/src/types/app";

/* ── Tab panels ─────────────────────────────────────────────────────────── */

function DNATab() {
  const dna = useAppStore((s) => s.dna);
  const setDNA = useAppStore((s) => s.actions.setDNA);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] text-white/50 leading-snug">
        Representación didáctica de ADN: doble hélice, pares A–T y C–G, backbone azúcar-fosfato.
      </p>
      <Slider label="Pares de bases" value={dna.pairs} min={20} max={200} step={1}
        rightLabel={String(dna.pairs)} onChange={(v) => setDNA({ pairs: v })} />
      <Slider label="Radio hélice" value={dna.radius} min={0.5} max={3} onChange={(v) => setDNA({ radius: v })} />
      <Slider label="Pitch (giro/par)" value={dna.pitch} min={0.1} max={0.8} onChange={(v) => setDNA({ pitch: v })} />
      <Slider label="Separación vertical" value={dna.separation} min={0.05} max={0.5} onChange={(v) => setDNA({ separation: v })} />
      <Slider label="Velocidad rotación" value={dna.rotateSpeed} min={0} max={2} onChange={(v) => setDNA({ rotateSpeed: v })} />
      <Slider label="Respiración" value={dna.breathing} min={0} max={1} onChange={(v) => setDNA({ breathing: v })} />
      <Toggle label="Mostrar etiquetas" checked={dna.showLabels} onChange={(v) => setDNA({ showLabels: v })} />
      <Toggle label="Modo examen" checked={dna.examMode}
        hint="Oculta tipo de base; intentá identificarla." onChange={(v) => setDNA({ examMode: v })} />
      <div className="text-[11px] text-white/50">
        Secuencia actual: <span className="font-mono text-sky-300/80 break-all">{dna.sequence.slice(0, 30)}{dna.sequence.length > 30 ? "…" : ""}</span>
      </div>
    </div>
  );
}

function PackTab() {
  const level = useAppStore((s) => s.pack.level);
  const setPackLevel = useAppStore((s) => s.actions.setPackLevel);

  const stages = [
    { range: "0–19", label: "Hélice libre + Célula" },
    { range: "20–59", label: "Nucleosomas (histona simplificada)" },
    { range: "60–84", label: "Fibra 30 nm (abstracción)" },
    { range: "85–100", label: "Cromosoma abstracto" }
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] text-white/50 leading-snug">
        Empaquetamiento progresivo: ADN → nucleosomas → fibra → cromosoma. Modelo simplificado.
      </p>
      <Slider label="Nivel de empaquetamiento" value={level} min={0} max={100} step={1}
        rightLabel={`${level}%`} onChange={setPackLevel} />
      <div className="flex flex-col gap-1 mt-1">
        {stages.map((s) => (
          <div key={s.range} className="flex gap-2 text-[11px]">
            <span className="text-white/40 font-mono w-12 shrink-0">{s.range}</span>
            <span className="text-white/70">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VoidTab() {
  const vf = useAppStore((s) => s.voidField);
  const setVoid = useAppStore((s) => s.actions.setVoid);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl bg-amber-500/10 border border-amber-400/20 px-3 py-2 text-[11px] text-amber-200/80">
        ⚠ El "genoma del vacío" es una <b>metáfora artística</b>. No corresponde a ningún concepto físico real.
      </div>
      <Slider label="Intensidad campo" value={vf.intensity} min={0} max={1} onChange={(v) => setVoid({ intensity: v })} />
      <Select
        label="Modo visualización"
        value={vf.mode}
        options={[
          { value: "field", label: "Campo (shader FBM)" },
          { value: "particles", label: "Partículas" }
        ]}
        onChange={(v) => setVoid({ mode: v as "field" | "particles" })}
      />
      {vf.mode === "particles" && (
        <Slider label="Densidad partículas" value={vf.particleDensity} min={0.1} max={1} onChange={(v) => setVoid({ particleDensity: v })} />
      )}
    </div>
  );
}

function EinsteinTab() {
  const ein = useAppStore((s) => s.einstein);
  const setEinstein = useAppStore((s) => s.actions.setEinstein);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl bg-violet-500/10 border border-violet-400/20 px-3 py-2 text-[11px] text-violet-200/80">
        Modelo didáctico inspirado en relatividad general. <b>No es simulación científica exacta.</b>
      </div>
      <Slider label="Masa central" value={ein.mass} min={0} max={1.5} onChange={(v) => setEinstein({ mass: v })} />
      <Slider label="Intensidad curvatura" value={ein.warp} min={0} max={1.5} onChange={(v) => setEinstein({ warp: v })} />
      <Slider label="Escala espacio" value={ein.scale} min={0.3} max={2} onChange={(v) => setEinstein({ scale: v })} />
      <Toggle label="Mostrar geodésicas" checked={ein.showGeodesics}
        hint="Curvas aproximadas (modelo visual, no exactas)." onChange={(v) => setEinstein({ showGeodesics: v })} />
    </div>
  );
}

function DarwinTab() {
  const darwin = useAppStore((s) => s.darwin);
  const dna = useAppStore((s) => s.dna);
  const { setDarwin, mutateOnce } = useAppStore((s) => s.actions);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] text-white/50 leading-snug">
        Mutación de secuencia (sustitución de base). "Selección" es criterio visual; no simulación evolutiva real.
      </p>
      <Slider label="Tasa de mutación" value={darwin.mutationRate} min={0} max={1}
        onChange={(v) => setDarwin({ mutationRate: v })} />
      <Slider label="Sesgo de selección" value={darwin.selectionBias} min={0} max={1}
        onChange={(v) => setDarwin({ selectionBias: v })} />
      <button
        className="rounded-xl px-4 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/20 text-sm transition"
        onClick={mutateOnce}
      >
        Mutar una base (aleatorio)
      </button>
      {darwin.history.length > 0 && (
        <div className="mt-1">
          <div className="text-[11px] text-white/50 mb-1">Historial (últimas {darwin.history.length}):</div>
          <div className="max-h-36 overflow-y-auto flex flex-col gap-1">
            {darwin.history.map((h, i) => (
              <div key={i} className="text-[10px] font-mono text-white/60 bg-black/20 rounded-lg px-2 py-1">
                #{h.index + 1} · {h.from}→{h.to} · {new Date(h.atISO).toLocaleTimeString()}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AcademicTab() {
  const glossary = [
    { term: "ADN", def: "Ácido desoxirribonucleico. Molécula que almacena información genética." },
    { term: "Nucleótido", def: "Unidad básica del ADN: base nitrogenada + azúcar + fosfato." },
    { term: "Par de bases", def: "A empareja con T; C empareja con G (reglas de Watson-Crick)." },
    { term: "Nucleosoma", def: "ADN enrollado alrededor de histonas (proteínas). Primer nivel de empaquetamiento." },
    { term: "Cromatina", def: "Complejo de ADN + proteínas en el núcleo celular." },
    { term: "Cromosoma", def: "ADN altamente empaquetado, visible en división celular." },
    { term: "Geodésica", def: "Camino más corto entre dos puntos en una geometría curva (aquí: modelo simplificado)." },
    { term: "Curvatura", def: "En relatividad: el espacio-tiempo se curva por la masa. Aquí: metáfora visual." },
    { term: "Campo", def: "En física: cantidad definida en cada punto del espacio. Aquí: ruido procedimental." }
  ];

  const bibliography = [
    "Watson & Crick (1953) – Molecular Structure of Nucleic Acids.",
    "Alberts et al. – Molecular Biology of the Cell (libro de referencia).",
    "Einstein (1916) – Die Grundlage der allgemeinen Relativitätstheorie.",
    "Hawking & Penrose – The Nature of Space and Time.",
    "Darwin (1859) – On the Origin of Species."
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-xs font-semibold text-white/70 mb-2 uppercase tracking-wide">Glosario</div>
        <div className="flex flex-col gap-2">
          {glossary.map((g) => (
            <div key={g.term} className="rounded-xl bg-black/20 border border-white/10 px-3 py-2">
              <div className="text-sm font-semibold text-sky-300">{g.term}</div>
              <div className="text-[11px] text-white/60 mt-0.5">{g.def}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs font-semibold text-white/70 mb-2 uppercase tracking-wide">Bibliografía sugerida</div>
        <ul className="flex flex-col gap-1">
          {bibliography.map((b, i) => (
            <li key={i} className="text-[11px] text-white/55 leading-snug">• {b}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl bg-indigo-500/10 border border-indigo-400/20 px-3 py-3 text-[11px] text-indigo-200/80 leading-relaxed">
        <b>Mensaje final:</b> El ADN es la molécula de la herencia: su doble hélice almacena instrucciones en cuatro
        letras (A, T, C, G). El empaquetamiento permite comprimir metros de ADN en un núcleo microscópico. El "vacío"
        y el "universo" son metáforas visuales para explorar escalas y modelos. La ciencia trabaja con modelos
        simplificados que se declaran como tales.
      </div>
    </div>
  );
}

function MethodTab() {
  const items = [
    { title: "Geometría paramétrica", body: "Las esferas y cilindros del ADN son geometrías THREE.js construidas matemáticamente, no datos moleculares reales. Se ajustan radio, pitch y separación." },
    { title: "Instanced Mesh", body: "Para performance: en vez de N meshes separados, se usa una sola geometría instanciada con matrices de transformación. Reduce draw calls." },
    { title: "Shaders (GLSL)", body: "El campo del vacío y el espacio de Einstein usan shaders escritos en GLSL. Son programas que corren en la GPU y calculan color/posición por píxel/vértice." },
    { title: "Ruido FBM", body: "Fractional Brownian Motion: suma de capas de ruido a distintas frecuencias. Produce texturas orgánicas/nebulosas. Aquí: metáfora del 'vacío cuántico'." },
    { title: "Curvatura didáctica", body: "El pozo gravitatorio es una deformación de una malla plana usando un vértice shader. No resuelve las ecuaciones de campo de Einstein." },
    { title: "Metáfora vs. Ciencia", body: "Científico: estructura del ADN (hélice, emparejamiento, empaquetamiento). Metáfora: 'genoma del vacío', curvatura, geodésicas aproximadas, célula abstracta." },
    { title: "Limitaciones", body: "No es simulación molecular, ni relativista, ni evolutiva. Es un sistema educativo que usa modelos visuales para transmitir conceptos." }
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] text-white/50 leading-snug">
        Transparencia sobre cómo se construye cada visualización.
      </p>
      {items.map((item) => (
        <div key={item.title} className="rounded-xl bg-black/20 border border-white/10 px-3 py-2">
          <div className="text-sm font-semibold text-emerald-300">{item.title}</div>
          <div className="text-[11px] text-white/60 mt-0.5 leading-snug">{item.body}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Main Panel ──────────────────────────────────────────────────────────── */

const TAB_CONTENT: Record<TabKey, React.ReactNode> = {
  dna: <DNATab />,
  pack: <PackTab />,
  void: <VoidTab />,
  einstein: <EinsteinTab />,
  darwin: <DarwinTab />,
  academic: <AcademicTab />,
  method: <MethodTab />
};

export default function Panel() {
  const activeTab = useAppStore((s) => s.ui.activeTab);
  const setActiveTab = useAppStore((s) => s.actions.setActiveTab);
  const setShowPresentation = useAppStore((s) => s.actions.setShowPresentation);

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-white/10">
        <Tabs active={activeTab} onChange={setActiveTab} />
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {TAB_CONTENT[activeTab]}
      </div>
      <div className="p-3 border-t border-white/10">
        <button
          className="w-full rounded-xl px-4 py-2 text-xs bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-400/20 transition"
          onClick={() => setShowPresentation(true)}
        >
          ▶ Presentación guiada
        </button>
      </div>
    </div>
  );
}
