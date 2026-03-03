import type { Base } from "@/src/types/app";

const BASES: Base[] = ["A", "T", "C", "G"];

export function sanitizeSequence(seq: string): string {
  const up = (seq || "").toUpperCase();
  let out = "";
  for (const ch of up) {
    if (ch === "A" || ch === "T" || ch === "C" || ch === "G") out += ch;
  }
  return out;
}

export function complement(b: Base): Base {
  switch (b) {
    case "A":
      return "T";
    case "T":
      return "A";
    case "C":
      return "G";
    case "G":
      return "C";
  }
}

export function mutateSequence(seq: string): { sequence: string; index: number; from: Base; to: Base } {
  const s = sanitizeSequence(seq);
  const baseSeq = s.length ? s : "ATCG";
  const index = Math.floor(Math.random() * baseSeq.length);
  const from = baseSeq[index] as Base;
  let to: Base = from;
  while (to === from) to = BASES[Math.floor(Math.random() * BASES.length)]!;
  const next = baseSeq.slice(0, index) + to + baseSeq.slice(index + 1);
  return { sequence: next, index, from, to };
}
