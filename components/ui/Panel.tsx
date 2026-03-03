"use client";

import { useAppStore } from "@/src/store/appStore";
import { Tabs } from "./Tabs";
import { Slider } from "./Slider";
import { Toggle } from "./Toggle";
import { Select } from "./Select";
import type { TabKey, Base } from "@/src/types/app";
import { baseColor } from "@/src/lib/colors";
import { downloadTextFile } from "@/src/lib/exporters";

export default function Panel() {
  const activeTab = useAppStore((s) => s.ui.activeTab);
  const actions = useAppStore((s) => s.actions);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-3 border-b border-white/10">
        <Tabs active={activeTab} onChange={(k: TabKey) => actions.setActiveTab(k)} />
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "dna" && <DNATab />}
        {activeTab === "pack" && <PackTab />}
        {activeTab === "void" && <VoidTab />}
        {activeTab === "einstein" && <EinsteinTab />}
        {activeTab === "darwin" && <DarwinTab />}
        {activeTab === "academic" && <AcademicTab />}
        {activeTab === "method" && <MethodTab />}
      </div>
    </div>
  );
}

/* ─── DNA Tab ─── */
function DNATab() {
  const dna = useAppStore((s) => s.dna);
  const { setDNA } = useAppStore((s) => s.actions);

  return (
    <div className="space-y-4">
      <SectionTitle>ADN — Representación didáctica</SectionTitle>
      <Note>Modelo educativo de la doble hélice. Pares A–T y C–G, backbone azúcar-fosfato representado.</Note>
      <Slider label="Pares de bases" value={dna.pairs} min={20} max={200} step={1}
        rightLabel={String(dna.pairs)} onChange={(v) => setDNA({ pairs: v })} />
      <Slider label="Radio" value={dna.radius} min={0.6} max={2.5} onChange={(v) => setDNA({ radius: v })} />
      <Slider label="Pitch (paso)" value={dna.pitch} min={0.1} max={0.8} onChange={(v) => setDNA({ pitch: v })} />
      <Slider label="Velocidad rotación" value={dna.rotateSpeed} min={0} max={1} onChange={(v) => setDNA({ rotateSpeed: v })} />
      <Slider label="Respiración" value={dna.breathing} min={0} max={1} onChange={(v) => setDNA({ breathing: v })} />
      <Toggle label="Mostrar etiquetas" checked={dna.showLabels} onChange={(v) => setDNA({ showLabels: v })} />
      <Toggle label="Modo examen" hint="Oculta bases — identificalas" checked={dna.examMode} onChange={(v) => setDNA({ examMode: v })} />
      <div className="pt-2">
        <div className="text-[11px] text-white/60 mb-1">Secuencia (A/T/C/G)</div>
        <input
          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-white/20 uppercase"
          value={dna.sequence}
          onChange={(e) => setDNA({ sequence: e.target.value.toUpperCase().replace(/[^ATCG]/g, "") })}
          maxLength={200}
          spellCheck={false}
        />
      </div>
      <div className="grid grid-cols-4 gap-1 mt-2">
        {(["A", "T", "C", "G"] as Base[]).map((b) => (
          <div key={b} className="rounded-lg border border-white/10 p-2 text-center text-xs font-mono"
            style={{ color: baseColor(b) }}>
            {b}
          </div>
        ))}
      </div>
      <div className="text-[10px] text-white/40">A–T: 2 enlaces H | C–G: 3 enlaces H</div>
    </div>
  );
}

/* ─── Pack Tab ─── */
function PackTab() {
  const level = useAppStore((s) => s.pack.level);
  const { setPackLevel } = useAppStore((s) => s.actions);

  const stageLabel =
    level < 20 ? "ADN libre (hélice)"
    : level < 40 ? "Nucleosomas (representación simplificada)"
    : level < 65 ? "Fibra de cromatina (modelo)"
    : level < 88 ? "Cromatina condensada"
    : "Cromosoma abstracto (modelo didáctico)";

  return (
    <div className="space-y-4">
      <SectionTitle>Empaquetamiento</SectionTitle>
      <Note>Progresión educativa: ADN → nucleosomas → fibra → cromosoma. Modelo simplificado.</Note>
      <Slider label="Nivel de empaquetamiento" value={level} min={0} max={100} step={1}
        rightLabel={`${level}%`} onChange={setPackLevel} />
      <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
        {stageLabel}
      </div>
      <div className="space-y-1 text-[11px] text-white/60">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${level < 20 ? "bg-sky-400" : "bg-white/20"}`} /> 0–20%: Hélice libre
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${level >= 20 && level < 60 ? "bg-violet-400" : "bg-white/20"}`} /> 20–60%: Nucleosomas
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${level >= 60 && level < 88 ? "bg-indigo-400" : "bg-white/20"}`} /> 60–88%: Fibra
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${level >= 88 ? "bg-purple-400" : "bg-white/20"}`} /> 88–100%: Cromosoma
        </div>
      </div>
    </div>
  );
}

/* ─── Void Tab ─── */
function VoidTab() {
  const voidState = useAppStore((s) => s.voidField);
  const { setVoid } = useAppStore((s) => s.actions);

  return (
    <div className="space-y-4">
      <SectionTitle>Vacío — Metáfora artística</SectionTitle>
      <MetaNote>⚠️ "Genoma del vacío" es una metáfora visual, no un concepto científico.</MetaNote>
      <Select
        label="Modo"
        value={voidState.mode}
        options={[
          { value: "field", label: "Campo (shader)" },
          { value: "particles", label: "Partículas" },
        ]}
        onChange={(v) => setVoid({ mode: v as "field" | "particles" })}
      />
      <Slider label="Intensidad" value={voidState.intensity} min={0} max={1} onChange={(v) => setVoid({ intensity: v })} />
      {voidState.mode === "particles" && (
        <Slider label="Densidad de partículas" value={voidState.particleDensity} min={0.1} max={1}
          onChange={(v) => setVoid({ particleDensity: v })} />
      )}
    </div>
  );
}

/* ─── Einstein Tab ─── */
function EinsteinTab() {
  const einstein = useAppStore((s) => s.einstein);
  const { setEinstein } = useAppStore((s) => s.actions);

  return (
    <div className="space-y-4">
      <SectionTitle>Einstein — Modelo didáctico</SectionTitle>
      <MetaNote>Curvatura inspirada en relatividad general. No es una simulación científica exacta.</MetaNote>
      <Slider label="Masa central" value={einstein.mass} min={0} max={2} onChange={(v) => setEinstein({ mass: v })} />
      <Slider label="Intensidad curvatura" value={einstein.warp} min={0} max={2} onChange={(v) => setEinstein({ warp: v })} />
      <Slider label="Escala" value={einstein.scale} min={0.5} max={2} onChange={(v) => setEinstein({ scale: v })} />
      <Toggle label="Geodésicas aproximadas" hint="Líneas que se curvan en el campo" checked={einstein.showGeodesics}
        onChange={(v) => setEinstein({ showGeodesics: v })} />
    </div>
  );
}

/* ─── Darwin Tab ─── */
function DarwinTab() {
  const darwin = useAppStore((s) => s.darwin);
  const dna = useAppStore((s) => s.dna);
  const { setDarwin, mutateOnce } = useAppStore((s) => s.actions);

  return (
    <div className="space-y-4">
      <SectionTitle>Darwin — Mutación y selección</SectionTitle>
      <Note>Mutación: cambio aleatorio de base. "Selección": metáfora visual de estabilidad, no simulación evolutiva real.</Note>
      <Slider label="Tasa de mutación" value={darwin.mutationRate} min={0} max={1}
        onChange={(v) => setDarwin({ mutationRate: v })} />
      <Slider label="Sesgo de selección" value={darwin.selectionBias} min={0} max={1}
        onChange={(v) => setDarwin({ selectionBias: v })} />
      <button
        className="w-full rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 py-2 text-sm transition"
        onClick={mutateOnce}
      >
        Mutar una vez
      </button>
      <div className="text-[11px] text-white/60">Secuencia actual:</div>
      <div className="font-mono text-[10px] break-all text-sky-300">{dna.sequence}</div>
      {darwin.history.length > 0 && (
        <div className="space-y-1">
          <div className="text-[11px] text-white/60">Historial (últimas {Math.min(5, darwin.history.length)}):</div>
          {darwin.history.slice(0, 5).map((h, i) => (
            <div key={i} className="flex gap-2 text-[10px] font-mono bg-black/20 rounded px-2 py-1">
              <span className="text-white/40">#{h.index + 1}</span>
              <span style={{ color: baseColor(h.from) }}>{h.from}</span>
              <span className="text-white/40">→</span>
              <span style={{ color: baseColor(h.to) }}>{h.to}</span>
              <span className="text-white/30 ml-auto">{new Date(h.atISO).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Academic Tab ─── */
function AcademicTab() {
  return (
    <div className="space-y-4">
      <SectionTitle>Glosario y bibliografía</SectionTitle>
      <div className="space-y-2">
        {GLOSSARY.map((g) => (
          <div key={g.term} className="rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="text-sm font-semibold text-sky-300">{g.term}</div>
            <div className="text-[11px] text-white/70 mt-1 leading-relaxed">{g.def}</div>
          </div>
        ))}
      </div>
      <SectionTitle>Bibliografía sugerida</SectionTitle>
      <div className="space-y-1 text-[11px] text-white/60">
        {BIBLIOGRAPHY.map((b, i) => (
          <div key={i} className="leading-relaxed">• {b}</div>
        ))}
      </div>
    </div>
  );
}

/* ─── Method Tab ─── */
function MethodTab() {
  const { buildReport } = useAppStore((s) => s.actions);

  const handleExport = () => {
    const report = buildReport();
    downloadTextFile(`reporte-academico-${Date.now()}.json`, JSON.stringify(report, null, 2));
  };

  return (
    <div className="space-y-4">
      <SectionTitle>Metodología</SectionTitle>
      <div className="space-y-3">
        {METHOD_ITEMS.map((item, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="text-sm font-semibold">{item.title}</div>
            <div className="text-[11px] text-white/70 mt-1 leading-relaxed">{item.body}</div>
          </div>
        ))}
      </div>
      <button
        className="w-full rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/20 py-2 text-sm transition"
        onClick={handleExport}
      >
        Exportar reporte académico (JSON)
      </button>
    </div>
  );
}

/* ─── Helpers ─── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-semibold text-white/90">{children}</div>;
}
function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] text-white/60 bg-black/20 border border-white/10 rounded-xl px-3 py-2 leading-relaxed">
      {children}
    </div>
  );
}
function MetaNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] text-amber-300/80 bg-amber-900/10 border border-amber-400/15 rounded-xl px-3 py-2 leading-relaxed">
      {children}
    </div>
  );
}

/* ─── Data ─── */
const GLOSSARY = [
  { term: "ADN", def: "Ácido desoxirribonucleico; molécula que almacena información genética en una doble hélice." },
  { term: "Nucleótido", def: "Unidad básica del ADN: base nitrogenada + azúcar (desoxirribosa) + fosfato." },
  { term: "Base nitrogenada", def: "Adenina (A), Timina (T), Citosina (C) o Guanina (G)." },
  { term: "Enlace de hidrógeno", def: "A–T: 2 puentes de H. C–G: 3 puentes de H. Mantiene unidas las cadenas." },
  { term: "Nucleosoma", def: "Unidad de empaquetamiento: ADN enrollado en un octámero de histonas." },
  { term: "Cromatina", def: "Complejo de ADN y proteínas en el núcleo celular." },
  { term: "Cromosoma", def: "Estructura altamente condensada de cromatina, visible en división celular." },
  { term: "Membrana", def: "Bicapa lipídica que delimita la célula y sus compartimentos internos." },
  { term: "Campo", def: "Aquí: campo de ruido procedimental (metáfora artística)." },
  { term: "Geodésica", def: "Curva de menor longitud en un espacio curvo (geometría diferencial)." },
  { term: "Curvatura", def: "En relatividad general, la gravedad curva el espacio-tiempo (aquí: modelo visual simplificado)." },
];

const BIBLIOGRAPHY = [
  "Alberts B. et al. — Molecular Biology of the Cell (Garland Science).",
  "Watson J.D. & Crick F.H.C. — A structure for deoxyribose nucleic acid. Nature, 1953.",
  "Luger K. et al. — Crystal structure of the nucleosome core particle. Nature, 1997.",
  "Einstein A. — Die Grundlage der allgemeinen Relativitätstheorie. Ann. Phys., 1916.",
  "Milo R. & Phillips R. — Cell Biology by the Numbers (Garland Science).",
];

const METHOD_ITEMS = [
  {
    title: "¿Qué es geometría?",
    body: "Las formas 3D (esferas, tubos, planos) son primitivas geométricas. No representan átomos individuales, sino patrones educativos."
  },
  {
    title: "¿Qué es shading?",
    body: "Los colores y deformaciones de 'Einstein' y 'Vacío' son shaders GLSL (programas GPU) que simulan apariencia, no física real."
  },
  {
    title: "Ciencia vs. Metáfora",
    body: "ADN: representación didáctica con base en consenso científico. Vacío/Einstein/Célula: modelos visuales o metáforas declaradas."
  },
  {
    title: "Limitaciones del modelo",
    body: "No es una simulación molecular ni relativista exacta. No apto para investigación; sólo para divulgación y educación."
  },
];
