"use client";

export function Toggle({
  label,
  checked,
  onChange,
  hint
}: {
  label: string;
  checked: boolean;
  hint?: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      className="w-full flex items-center justify-between gap-3 rounded-xl bg-black/20 border border-white/10 px-3 py-2 hover:bg-black/25 transition"
      onClick={() => onChange(!checked)}
    >
      <div className="text-left">
        <div className="text-sm">{label}</div>
        {hint ? <div className="text-[11px] text-white/60">{hint}</div> : null}
      </div>
      <div className={`w-10 h-6 rounded-full border border-white/15 flex items-center px-1 ${checked ? "bg-emerald-400/20" : "bg-white/5"}`}>
        <div className={`w-4 h-4 rounded-full ${checked ? "translate-x-4 bg-emerald-200" : "translate-x-0 bg-white/70"} transition`} />
      </div>
    </button>
  );
}
