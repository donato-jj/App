"use client";
import { useAppStore } from "@/src/store/appStore";
import { Tabs } from "./Tabs";
import { Slider } from "./Slider";
import { Toggle } from "./Toggle";
import { Select } from "./Select";
import type { TabKey } from "@/src/types/app";
import { baseColor } from "@/src/lib/colors";
import type { Base } from "@/src/types/app";

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] text-amber-300/70 bg-amber-400/5 border border-amber-400/10 rounded-xl px-3 py-2 mt-1">
      {children}
    </div>
  );
}

function ScienceNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] text-sky-300/70 bg-sky-400/5 border border-sky-400/10 rounded-xl px-3 py-2 mt-1">
      {children}
    </div>
  );
}

function DNATab() {
  const dna = useAppStore((s) => s.dna);
  const setDNA = useAppStore((s) => s.actions.setDNA);
  const seq = dna.sequence.slice(0, 30);
  return (
    <div className="flex flex-col gap-3">
      <Slider label="Pares de bases" value={dna.pairs} min={20} max={200} step={1} rightLabel={String(dna.pairs)} onChange={(v) => setDNA({ pairs: Math.round(v) })} />
      <Slider label="Radio (Å repr.)" value={dna.radius} min={0.5} max={3} onChange={(v) => setDNA({ radius: v })} />
      <Slider label="Pitch (separación vertical)" value={dna.pitch} min={0.1} max={0.8} onChange={(v) => setDNA({ pitch: v })} />
      <Slider label="Vel. rotación" value={dna.rotateSpeed} min={0} max={1} onChange={(v) => setDNA({ rotateSpeed: v })} />
      <Slider label="Respiración" value={dna.breathing} min={0} max={1} onChange={(v) => setDNA({ breathing: v })} />
      <Toggle label="Mostrar etiquetas" checked={dna.showLabels} onChange={(v) => setDNA({ showLabels: v })} />
      <Toggle label="Modo examen" checked={dna.examMode} hint="Oculta bases — prueba tu conocimiento" onChange={(v) => setDNA({ examMode: v })} />
      <div className="mt-1">
        <div className="text-[11px] text-white/50 mb-1">Secuencia (primeros 30 nt)</div>
        <div className="font-mono text-[11px] bg-black/30 border border-white/10 rounded-xl px-3 py-2 flex flex-wrap gap-[2px]">
          {seq.split("").map((b, i) => (
            <span key={i} style={{ color: baseColor(b as Base) }}>{b}</span>
          ))}
        </div>
      </div>
      <ScienceNote>ADN representado didácticamente: pares A–T, C–G y backbone (fosfato/desoxirribosa). Radio y pitch simplificados para visualización.</ScienceNote>
    </div>
  );
}

function PackTab() {
  const level = useAppStore((s) => s.pack.level);
  const setPackLevel = useAppStore((s) => s.actions.setPackLevel);
  const stages = [
    { range: "0–20", label: "ADN desnudo (doble hélice)" },
    { range: "20–40", label: "Nucleosomas (octámero de histonas)" },
    { range: "40–60", label: "Fibra solenoide (30 nm)" },
    { range: "60–80", label: "Dominios en bucle (looped domains)" },
    { range: "80–100", label: "Cromosoma condensado (metafásico)" },
  ];
  return (
    <div className="flex flex-col gap-3">
      <Slider label="Nivel de empaquetamiento" value={level} min={0} max={100} step={1} rightLabel={String(level)} onChange={setPackLevel} />
      <div className="flex flex-col gap-1 mt-1">
        {stages.map((s) => {
          const [lo, hi] = s.range.split("–").map(Number);
          const active = level >= lo! && level <= hi!;
          return (
            <div key={s.range} className={`text-[11px] rounded-xl px-3 py-1.5 border transition ${active ? "bg-indigo-500/15 border-indigo-400/20 text-indigo-200" : "bg-black/20 border-white/5 text-white/50"}`}>
              <b>{s.range}</b>: {s.label}
            </div>
          );
        })}
      </div>
      <Note>Representación simplificada. En la realidad, el empaquetamiento es un proceso dinámico y regulado.</Note>
    </div>
  );
}

function VoidTab() {
  const vf = useAppStore((s) => s.voidField);
  const setVoid = useAppStore((s) => s.actions.setVoid);
  return (
    <div className="flex flex-col gap-3">
      <Select
        label="Modo"
        value={vf.mode}
        options={[
          { value: "field", label: "Campo (shader)" },
          { value: "particles", label: "Partículas" },
        ]}
        onChange={(v) => setVoid({ mode: v as "field" | "particles" })}
      />
      <Slider label="Intensidad" value={vf.intensity} min={0} max={1} onChange={(v) => setVoid({ intensity: v })} />
      {vf.mode === "particles" && (
        <Slider label="Densidad de partículas" value={vf.particleDensity} min={0} max={1} onChange={(v) => setVoid({ particleDensity: v })} />
      )}
      <Note>"Genoma del vacío" es una metáfora artística. Las fluctuaciones visuales son ruido procedimental (FBM), no simulación física cuántica.</Note>
    </div>
  );
}

function EinsteinTab() {
  const e = useAppStore((s) => s.einstein);
  const setEinstein = useAppStore((s) => s.actions.setEinstein);
  return (
    <div className="flex flex-col gap-3">
      <Slider label="Masa (parámetro didáctico)" value={e.mass} min={0} max={2} onChange={(v) => setEinstein({ mass: v })} />
      <Slider label="Deformación" value={e.warp} min={0} max={2} onChange={(v) => setEinstein({ warp: v })} />
      <Slider label="Escala" value={e.scale} min={0.5} max={2} onChange={(v) => setEinstein({ scale: v })} />
      <Toggle label="Mostrar geodésicas" checked={e.showGeodesics} onChange={(v) => setEinstein({ showGeodesics: v })} hint="Líneas curvadas por la 'masa'" />
      <Note>Modelo didáctico inspirado en relatividad general. No es una simulación científica exacta — la curvatura es procedimental (shader).</Note>
    </div>
  );
}

function DarwinTab() {
  const darwin = useAppStore((s) => s.darwin);
  const setDarwin = useAppStore((s) => s.actions.setDarwin);
  const mutateOnce = useAppStore((s) => s.actions.mutateOnce);
  return (
    <div className="flex flex-col gap-3">
      <Slider label="Tasa de mutación" value={darwin.mutationRate} min={0} max={1} onChange={(v) => setDarwin({ mutationRate: v })} />
      <Slider label="Sesgo de selección" value={darwin.selectionBias} min={0} max={1} onChange={(v) => setDarwin({ selectionBias: v })} />
      <button
        className="rounded-xl px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/20 text-sm transition"
        onClick={mutateOnce}
      >
        Mutar una vez
      </button>
      {darwin.history.length > 0 && (
        <div className="flex flex-col gap-1 mt-1">
          <div className="text-[11px] text-white/50">Historial (últimas 10)</div>
          <div className="max-h-40 overflow-y-auto flex flex-col gap-1">
            {darwin.history.slice(0, 10).map((h, i) => (
              <div key={i} className="text-[11px] bg-black/20 border border-white/5 rounded-xl px-3 py-1 font-mono flex gap-2">
                <span className="text-white/40">#{h.index}</span>
                <span style={{ color: baseColor(h.from) }}>{h.from}</span>
                <span className="text-white/30">→</span>
                <span style={{ color: baseColor(h.to) }}>{h.to}</span>
                <span className="text-white/30 ml-auto">{h.atISO.slice(11, 19)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const GLOSSARY = [
  { term: "ADN", def: "Ácido desoxirribonucleico: molécula que almacena información genética." },
  { term: "Nucleótido", def: "Unidad básica del ADN: base nitrogenada + azúcar + fosfato." },
  { term: "Base nitrogenada", def: "Adenina (A), Timina (T), Citosina (C), Guanina (G)." },
  { term: "Par de bases", def: "A–T (2 puentes de H) y C–G (3 puentes de H)." },
  { term: "Backbone", def: "Esqueleto azúcar-fosfato que forma los 'rieles' de la hélice." },
  { term: "Surco mayor/menor", def: "Ranuras en la hélice: el mayor (~22 Å) y menor (~12 Å)." },
  { term: "Nucleosoma", def: "ADN enrollado ~146 pb alrededor de un octámero de histonas." },
  { term: "Cromatina", def: "Complejo ADN + proteínas en el núcleo celular." },
  { term: "Cromosoma", def: "Cromatina altamente compactada, visible en metafase." },
  { term: "Membrana celular", def: "Bicapa lipídica que delimita la célula." },
  { term: "Campo (física)", def: "Magnitud definida en cada punto del espacio (ej. campo gravitacional)." },
  { term: "Geodésica", def: "Trayectoria más corta en un espacio curvo (relatividad general)." },
  { term: "Curvatura espacial", def: "En RG: la masa curva el espacio-tiempo, afectando trayectorias." },
];

const BIBLIO = [
  "Watson & Crick (1953). Molecular Structure of Nucleic Acids. Nature.",
  "Alberts et al. Molecular Biology of the Cell (6th ed.). Garland.",
  "Luger et al. (1997). Crystal structure of the nucleosome core particle. Nature.",
  "Einstein, A. (1916). Die Grundlage der allgemeinen Relativitätstheorie. Annalen der Physik.",
  "Schrödinger, E. (1944). What is Life? Cambridge University Press.",
];

function AcademicTab() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-2">Glosario</div>
        <div className="flex flex-col gap-1">
          {GLOSSARY.map((g) => (
            <div key={g.term} className="text-[11px] bg-black/20 border border-white/5 rounded-xl px-3 py-2">
              <span className="text-sky-300 font-semibold">{g.term}</span>
              <span className="text-white/60">: {g.def}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-2">Bibliografía sugerida</div>
        <div className="flex flex-col gap-1">
          {BIBLIO.map((b, i) => (
            <div key={i} className="text-[11px] text-white/60 bg-black/20 border border-white/5 rounded-xl px-3 py-2">{b}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MethodTab() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-2">Cómo se modela</div>
        <div className="flex flex-col gap-2 text-[11px] text-white/70">
          <div className="bg-black/20 border border-white/5 rounded-xl px-3 py-2">
            <b className="text-sky-300">Geometría:</b> Esferas e InstancedMesh para nucleótidos/backbone; planos subdivididos para campos.
          </div>
          <div className="bg-black/20 border border-white/5 rounded-xl px-3 py-2">
            <b className="text-emerald-300">Shading:</b> ShaderMaterial GLSL para vacío (FBM noise) y espacio Einstein (well + ripples procedurales).
          </div>
          <div className="bg-black/20 border border-white/5 rounded-xl px-3 py-2">
            <b className="text-amber-300">Metáfora:</b> "Vacío cuántico" y "curvatura Einstein" son metáforas visuales, no simulaciones físicas exactas.
          </div>
          <div className="bg-black/20 border border-white/5 rounded-xl px-3 py-2">
            <b className="text-purple-300">Ciencia:</b> Estructura de ADN (doble hélice, pares, backbone) y empaquetamiento representados con fidelidad didáctica.
          </div>
        </div>
      </div>
      <div>
        <div className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-2">Limitaciones</div>
        <div className="flex flex-col gap-1 text-[11px] text-white/60">
          {[
            ["ADN", "Tamaños/ángulos simplificados; no incluye surcos ni puentes de H explícitos."],
            ["Empaquetamiento", "Transición entre niveles es animación, no biofísica cuantitativa."],
            ["Einstein", "Shader procedimental; no resuelve ecuaciones de campo de Einstein."],
            ["Vacío", "Ruido FBM artístico; no modelo de QED/QFT."],
            ["Célula", "Forma esférica genérica; no organelos reales posicionados con precisión."],
          ].map(([sys, lim]) => (
            <div key={sys} className="bg-black/20 border border-white/5 rounded-xl px-3 py-2">
              <b className="text-white/80">{sys}:</b> {lim}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-amber-400/5 border border-amber-400/10 rounded-xl px-3 py-3">
        <div className="text-xs font-semibold text-amber-300 mb-1">Ciencia vs. Metáfora</div>
        <div className="text-[11px] text-white/60">
          Las secciones <b>ADN</b> y <b>Empaquetamiento</b> representan biología molecular con base científica.
          Las secciones <b>Vacío</b>, <b>Einstein</b> y <b>Célula</b> son modelos didácticos o metáforas artísticas declaradas explícitamente.
        </div>
      </div>
    </div>
  );
}

export default function Panel() {
  const activeTab = useAppStore((s) => s.ui.activeTab);
  const setActiveTab = useAppStore((s) => s.actions.setActiveTab);

  const renderTab = () => {
    switch (activeTab) {
      case "dna": return <DNATab />;
      case "pack": return <PackTab />;
      case "void": return <VoidTab />;
      case "einstein": return <EinsteinTab />;
      case "darwin": return <DarwinTab />;
      case "academic": return <AcademicTab />;
      case "method": return <MethodTab />;
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-3 border-b border-white/10">
        <Tabs active={activeTab} onChange={setActiveTab} />
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {renderTab()}
      </div>
    </div>
  );
}
