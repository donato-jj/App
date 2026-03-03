"use client";

export function Tooltip({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-3 shadow-soft max-w-[320px]">
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-[12px] text-white/70 leading-relaxed mt-1">{body}</div>
    </div>
  );
}
