"use client";

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  rightLabel
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  rightLabel?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[11px] text-white/60">{label}</div>
        <div className="text-[11px] text-white/60 tabular-nums">
          {rightLabel ?? value.toFixed(2)}
        </div>
      </div>
      <input
        className="w-full accent-white"
        type="range"
        min={min}
        max={max}
        step={step ?? 0.01}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
