import type { Base } from "@/src/types/app";

export const baseColor = (b: Base) => {
  switch (b) {
    case "A":
      return "#7dd3fc";
    case "T":
      return "#a78bfa";
    case "C":
      return "#34d399";
    case "G":
      return "#fbbf24";
  }
};

export const backboneColor = "#e5e7eb";
