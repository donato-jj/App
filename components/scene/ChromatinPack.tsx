"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useAppStore } from "@/src/store/appStore";

/* ChromatinPack shows the progressive packaging: 0=helix → 30=nucleosomes → 60=fiber → 90+=chromosome */

export default function ChromatinPack() {
  const groupRef = useRef<THREE.Group>(null);
  const pack = useAppStore((s) => s.pack.level);
  const isMob = useAppStore((s) => s.perf.isMobileHint);

  // Only show packaging elements when pack >= 20
  if (pack < 20) return null;

  const t = Math.max(0, (pack - 20) / 80); // 0 at pack=20, 1 at pack=100

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Nucleosome discs (appear at pack 30-60) */}
      {pack >= 28 && pack < 80 && <NucleosomeDiscs pack={pack} isMob={isMob} />}
      {/* Chromatin fiber (pack 60-90) */}
      {pack >= 58 && pack < 95 && <ChromatinFiber pack={pack} />}
      {/* Abstract chromosome (pack 90-100) */}
      {pack >= 88 && <AbstractChromosome pack={pack} t={t} />}

      {/* Label */}
      <Html position={[0, 8, 0]} style={{ pointerEvents: "none" }}>
        <div className="text-[10px] text-white/60 bg-black/40 rounded-lg px-2 py-1 border border-white/10">
          {pack < 30 ? "ADN libre" : pack < 60 ? "Nucleosomas (representación simplificada)" : pack < 90 ? "Fibra de cromatina (modelo)" : "Cromosoma abstracto (didáctico)"}
        </div>
      </Html>
    </group>
  );
}

function NucleosomeDiscs({ pack, isMob }: { pack: number; isMob: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = isMob ? 8 : 14;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const t = Math.min(1, (pack - 28) / 32);

  useMemo(() => {
    if (!ref.current) return;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 2.5;
      const y = (i - count / 2) * 0.6;
      dummy.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
      dummy.rotation.x = Math.PI / 2;
      dummy.scale.setScalar(0.7 * t);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
      ref.current.setColorAt(i, new THREE.Color().setHSL(0.7 + i * 0.03, 0.5, 0.55));
    }
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, [count, dummy, t]);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.003;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <cylinderGeometry args={[0.5, 0.5, 0.25, 16]} />
      <meshStandardMaterial roughness={0.4} metalness={0.2} vertexColors transparent opacity={0.85} />
    </instancedMesh>
  );
}

function ChromatinFiber({ pack }: { pack: number }) {
  const t = Math.min(1, (pack - 58) / 32);
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const steps = 30;
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 4;
      const r = 2 + Math.sin(i * 0.5) * 0.5;
      pts.push(new THREE.Vector3(Math.cos(angle) * r, (i - steps / 2) * 0.35, Math.sin(angle) * r));
    }
    return pts;
  }, []);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  const geo = useMemo(() => new THREE.TubeGeometry(curve, 60, 0.18, 8, false), [curve]);

  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color="#6366f1" roughness={0.3} metalness={0.3} transparent opacity={0.7 * t} />
    </mesh>
  );
}

function AbstractChromosome({ pack, t }: { pack: number; t: number }) {
  const ref = useRef<THREE.Group>(null);
  const opacity = Math.min(1, (pack - 88) / 12);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.2;
  });

  return (
    <group ref={ref} scale={[1 * t, 1 * t, 1 * t]}>
      {/* Two sister chromatids */}
      <mesh position={[-0.5, 0, 0]}>
        <capsuleGeometry args={[0.5, 4, 8, 16]} />
        <meshStandardMaterial color="#8b5cf6" roughness={0.3} metalness={0.4} transparent opacity={opacity} />
      </mesh>
      <mesh position={[0.5, 0, 0]}>
        <capsuleGeometry args={[0.5, 4, 8, 16]} />
        <meshStandardMaterial color="#7c3aed" roughness={0.3} metalness={0.4} transparent opacity={opacity} />
      </mesh>
      {/* Centromere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.4, 12, 12]} />
        <meshStandardMaterial color="#c4b5fd" roughness={0.2} metalness={0.5} transparent opacity={opacity} />
      </mesh>
      <Html position={[0, 4, 0]} style={{ pointerEvents: "none" }}>
        <div className="text-[10px] text-purple-300 bg-black/60 rounded px-2 py-1 border border-purple-400/20">
          Cromosoma (modelo abstracto)
        </div>
      </Html>
    </group>
  );
}
