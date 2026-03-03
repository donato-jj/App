"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useAppStore } from "@/src/store/appStore";
import { baseColor, backboneColor } from "@/src/lib/colors";
import { sanitizeSequence } from "@/src/lib/dna";
import type { Base } from "@/src/types/app";

const SPHERE_GEO = new THREE.SphereGeometry(0.13, 8, 8);
const BACKBONE_GEO = new THREE.SphereGeometry(0.07, 6, 6);

interface PairData {
  posA: THREE.Vector3;
  posB: THREE.Vector3;
  baseA: Base;
  baseB: Base;
  index: number;
}

function buildPairs(
  pairs: number,
  radius: number,
  pitch: number,
  separation: number,
  sequence: string
): PairData[] {
  const seq = sanitizeSequence(sequence) || "ATCG";
  const complement: Record<Base, Base> = { A: "T", T: "A", C: "G", G: "C" };
  const out: PairData[] = [];
  for (let i = 0; i < pairs; i++) {
    const angle = i * Math.PI * 2 * pitch;
    const y = (i - pairs / 2) * separation * 2;
    const baseA = (seq[i % seq.length] as Base) ?? "A";
    const baseB = complement[baseA];
    out.push({
      posA: new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius),
      posB: new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius),
      baseA,
      baseB,
      index: i
    });
  }
  return out;
}

function BaseSphere({
  position,
  color,
  base,
  index,
  showLabel,
  examMode
}: {
  position: THREE.Vector3;
  color: string;
  base: Base;
  index: number;
  showLabel: boolean;
  examMode: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const complement: Record<Base, Base> = { A: "T", T: "A", C: "G", G: "C" };

  return (
    <mesh
      geometry={SPHERE_GEO}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshStandardMaterial color={hovered ? "#ffffff" : color} roughness={0.4} metalness={0.1} />
      {hovered && (
        <Html distanceFactor={12} center>
          <div className="bg-black/80 border border-white/20 rounded-xl px-2 py-1 text-[10px] text-white whitespace-nowrap pointer-events-none">
            Par #{index + 1} · Base: {examMode ? "?" : base} · Comp.: {examMode ? "?" : complement[base]}
          </div>
        </Html>
      )}
      {showLabel && !hovered && (
        <Html distanceFactor={20} center>
          <div className="text-[8px] pointer-events-none" style={{ color: examMode ? "#aaa" : color }}>
            {examMode ? "?" : base}
          </div>
        </Html>
      )}
    </mesh>
  );
}

function HBonds({ pairData, opacity }: { pairData: PairData[]; opacity: number }) {
  const lineObj = useMemo(() => {
    const positions = new Float32Array(pairData.length * 6);
    for (let i = 0; i < pairData.length; i++) {
      const p = pairData[i]!;
      positions[i * 6] = p.posA.x;
      positions[i * 6 + 1] = p.posA.y;
      positions[i * 6 + 2] = p.posA.z;
      positions[i * 6 + 3] = p.posB.x;
      positions[i * 6 + 4] = p.posB.y;
      positions[i * 6 + 5] = p.posB.z;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.LineBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.25 * opacity });
    return new THREE.LineSegments(geo, mat);
  }, [pairData, opacity]);

  return <primitive object={lineObj} />;
}

export default function DNAHelix() {
  const dna = useAppStore((s) => s.dna);
  const packLevel = useAppStore((s) => s.pack.level);
  const isMobile = useAppStore((s) => s.perf.isMobileHint);

  const groupRef = useRef<THREE.Group>(null);

  const showLabels = dna.showLabels && packLevel < 10;
  const pairs = Math.min(dna.pairs, isMobile ? 60 : 200);

  const pairData = useMemo(
    () => buildPairs(pairs, dna.radius, dna.pitch, dna.separation, dna.sequence),
    [pairs, dna.radius, dna.pitch, dna.separation, dna.sequence]
  );

  // Backbone instanced mesh refs
  const backboneMeshARef = useRef<THREE.InstancedMesh>(null);
  const backboneMeshBRef = useRef<THREE.InstancedMesh>(null);

  // Update backbone instanced mesh matrices when pairData changes
  useEffect(() => {
    const dummy = new THREE.Object3D();
    [backboneMeshARef, backboneMeshBRef].forEach((ref, strand) => {
      if (!ref.current) return;
      pairData.forEach((p, i) => {
        const pos = strand === 0 ? p.posA : p.posB;
        dummy.position.copy(pos);
        dummy.updateMatrix();
        ref.current!.setMatrixAt(i, dummy.matrix);
      });
      ref.current.instanceMatrix.needsUpdate = true;
    });
  }, [pairData]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * dna.rotateSpeed * 0.3;
    const t = Date.now() * 0.001;
    const breathe = 1 + Math.sin(t * 1.2) * dna.breathing * 0.04;
    groupRef.current.scale.setScalar(breathe);
  });

  const visibility = Math.max(0, 1 - packLevel / 60);
  if (visibility <= 0) return null;

  return (
    <group ref={groupRef}>
      {/* Backbone strand A */}
      <instancedMesh ref={backboneMeshARef} args={[BACKBONE_GEO, undefined, pairs]}>
        <meshStandardMaterial color={backboneColor} roughness={0.5} metalness={0.05} transparent opacity={visibility} />
      </instancedMesh>
      {/* Backbone strand B */}
      <instancedMesh ref={backboneMeshBRef} args={[BACKBONE_GEO, undefined, pairs]}>
        <meshStandardMaterial color={backboneColor} roughness={0.5} metalness={0.05} transparent opacity={visibility} />
      </instancedMesh>

      {/* H-bond connectors as a single LineSegments object */}
      <HBonds pairData={pairData} opacity={visibility} />

      {/* Base pair spheres */}
      {pairData.map((p) => (
        <group key={p.index}>
          <BaseSphere
            position={p.posA}
            color={baseColor(p.baseA)}
            base={p.baseA}
            index={p.index}
            showLabel={showLabels}
            examMode={dna.examMode}
          />
          <BaseSphere
            position={p.posB}
            color={baseColor(p.baseB)}
            base={p.baseB}
            index={p.index}
            showLabel={showLabels}
            examMode={dna.examMode}
          />
        </group>
      ))}
    </group>
  );
}
