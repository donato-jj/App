"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Panel from "@/components/ui/Panel";
import TopBar from "@/components/ui/TopBar";
import Presentation from "@/components/Presentation";
import { useAppStore } from "@/src/store/appStore";

const SceneCanvas = dynamic(() => import("@/components/scene/SceneCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
      Cargando escena 3D…
    </div>
  )
});

export default function Page() {
  const [started, setStarted] = useState(false);
  const showPresentation = useAppStore((s) => s.ui.showPresentation);

  const shell = useMemo(
    () => (
      <div className="h-screen w-screen overflow-hidden">
        <TopBar />
        <div className="h-[calc(100vh-56px)] w-screen grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-0">
          <div className="relative">
            <SceneCanvas />
            <div className="absolute left-3 bottom-3 text-[11px] text-white/60 bg-black/30 border border-white/10 rounded-xl px-3 py-2 backdrop-blur-sm max-w-[420px]">
              <b>Nota:</b> ADN es representación didáctica. Vacío/Einstein/célula son modelos/metáforas declaradas.
            </div>
          </div>
          <div className="border-l border-white/10 bg-black/20 backdrop-blur-sm">
            <Panel />
          </div>
        </div>
        {showPresentation ? <Presentation /> : null}
      </div>
    ),
    [showPresentation]
  );

  if (!started) {
    return (
      <div className="h-screen w-screen flex items-center justify-center px-6">
        <div className="max-w-2xl w-full rounded-3xl border border-white/10 bg-black/30 backdrop-blur-sm shadow-soft p-8">
          <div className="text-xs uppercase tracking-widest text-white/60">
            Sistema de reconstrucción académica
          </div>
          <h1 className="mt-3 text-2xl md:text-3xl font-semibold">
            ADN, &ldquo;Genoma del Vacío&rdquo; (metáfora) y Universo inspirado en Einstein
          </h1>
          <p className="mt-4 text-white/80 leading-relaxed">
            Se separa explícitamente <b>representación científica</b> (ADN) de{" "}
            <b>metáforas/modelos didácticos</b> (campo de fluctuaciones procedimental, curvatura
            inspirada en Einstein, auto-organización celular).
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              className="rounded-2xl px-5 py-3 bg-white/10 hover:bg-white/15 border border-white/10 transition"
              onClick={() => setStarted(true)}
            >
              Entrar a la simulación
            </button>
            <button
              className="rounded-2xl px-5 py-3 bg-indigo-500/20 hover:bg-indigo-500/25 border border-indigo-400/20 transition"
              onClick={() => {
                setStarted(true);
                useAppStore.getState().actions.setShowPresentation(true);
              }}
            >
              Modo presentación guiada
            </button>
          </div>

          <div className="mt-6 text-xs text-white/60">
            Recomendación: en móvil usá calidad <b>Low</b> (TopBar) para FPS estable.
          </div>
        </div>
      </div>
    );
  }

  return shell;
}
