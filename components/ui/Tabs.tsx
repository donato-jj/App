"use client";

import type { TabKey } from "@/src/types/app";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "dna", label: "ADN" },
  { key: "pack", label: "Empaquetamiento" },
  { key: "void", label: "Vacío" },
  { key: "einstein", label: "Einstein" },
  { key: "darwin", label: "Darwin" },
  { key: "academic", label: "Académico" },
  { key: "method", label: "Metodología" }
];

export function Tabs({ active, onChange }: { active: TabKey; onChange: (k: TabKey) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {tabs.map((t) => (
        <button
          key={t.key}
          className={`rounded-xl px-3 py-2 text-sm border transition ${
            active === t.key ? "bg-white/10 border-white/20" : "bg-black/20 border-white/10 hover:bg-black/25"
          }`}
          onClick={() => onChange(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
