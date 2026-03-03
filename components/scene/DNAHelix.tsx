"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useAppStore } from "@/src/store/appStore";
import { baseColor, backboneColor } from "@/src/lib/colors";
import { sanitizeSequence, complement } from "@/src/lib/dna";
import type { Base } from "@/src/types/app";

export default function DNAHelix() {
  const groupRef = useRef<THREE.Group>(null);
  const dna = useAppStore((s) => s.dna);
  const packLevel = useAppStore((s) => s.pack.level);
  const breathRef = useRef(0);

  const { pairs, radius, pitch, rotateSpeed, breathing, showLabels, examMode, sequence } = dna;

  const seq = useMemo(() => {
    const s = sanitizeSequence(sequence);
    if (!s.length) return "ATCG".repeat(Math.ceil(pairs / 4)).slice(0, pairs);
    return s.repeat(Math.ceil(pairs / s.length)).slice(0, pairs) as string;
  }, [sequence, pairs]);

  const verticalStep = pitch;
  const pitchStep = (2 * Math.PI) / 10;
  const totalHeight = pairs * verticalStep;

  const backboneGeo = useMemo(() => new THREE.SphereGeometry(0.1, 6, 6), []);
  const baseGeo = useMemo(() => new THREE.SphereGeometry(0.12, 8, 8), []);
  const connectorGeo = useMemo(() => new THREE.CylinderGeometry(0.04, 0.04, 1, 6), []);

  const backbone1Mat = useMemo(() => new THREE.MeshPhongMaterial({ color: backboneColor }), []);
  const backbone2Mat = useMemo(() => new THREE.MeshPhongMaterial({ color: backboneColor }), []);
  const connectorMat = useMemo(() => new THREE.MeshPhongMaterial({ color: "#6b7280", transparent: true, opacity: 0.7 }), []);

  const baseMats = useMemo(() => {
    const bases: Base[] = ["A", "T", "C", "G"];
    const mats: Record<Base, THREE.MeshPhongMaterial> = {} as any;
    for (const b of bases) {
      mats[b] = new THREE.MeshPhongMaterial({ color: baseColor(b) });
    }
    return mats;
  }, []);

  const { strand1Positions, strand2Positions, bases1, bases2 } = useMemo(() => {
    const s1: THREE.Vector3[] = [];
    const s2: THREE.Vector3[] = [];
    const b1: Base[] = [];
    const b2: Base[] = [];
    for (let i = 0; i < pairs; i++) {
      const angle = i * pitchStep;
      const y = i * verticalStep - totalHeight / 2;
      const r = radius;
      s1.push(new THREE.Vector3(r * Math.cos(angle), y, r * Math.sin(angle)));
      s2.push(new THREE.Vector3(r * Math.cos(angle + Math.PI), y, r * Math.sin(angle + Math.PI)));
      const base1 = (seq[i] as Base) || "A";
      b1.push(base1);
      b2.push(complement(base1));
    }
    return { strand1Positions: s1, strand2Positions: s2, bases1: b1, bases2: b2 };
  }, [pairs, radius, pitch, seq, pitchStep, verticalStep, totalHeight]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    breathRef.current += delta;
    groupRef.current.rotation.y += rotateSpeed * delta;
    if (breathing > 0) {
      const breathScale = 1 + Math.sin(breathRef.current * 1.5) * 0.015 * breathing;
      groupRef.current.scale.setX(breathScale);
      groupRef.current.scale.setZ(breathScale);
    }
  });

  const opacity = packLevel > 20 ? Math.max(0, 1 - (packLevel - 20) / 30) : 1;
  if (opacity <= 0) return null;

  const showLabelsCapped = showLabels && !examMode && pairs <= 40;

  return (
    <group ref={groupRef}>
      {strand1Positions.map((pos1, i) => {
        const pos2 = strand2Positions[i]!;
        const b1 = bases1[i]!;
        const b2 = bases2[i]!;

        const mid = pos1.clone().lerp(pos2, 0.5);
        const dir = pos2.clone().sub(pos1);
        const len = dir.length();
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.clone().normalize()
        );

        return (
          <group key={i}>
            {/* Backbone strand 1 */}
            <mesh geometry={backboneGeo} material={backbone1Mat} position={pos1} />
            {/* Backbone strand 2 */}
            <mesh geometry={backboneGeo} material={backbone2Mat} position={pos2} />
            {/* Base 1 */}
            <mesh geometry={baseGeo} material={baseMats[b1]} position={pos1.clone().lerp(mid, 0.35)} />
            {/* Base 2 */}
            <mesh geometry={baseGeo} material={baseMats[b2]} position={pos2.clone().lerp(mid, 0.35)} />
            {/* Connector */}
            <mesh
              geometry={connectorGeo}
              material={connectorMat}
              position={mid}
              quaternion={quat}
              scale={[1, len, 1]}
            />
            {/* Labels */}
            {showLabelsCapped && (
              <Html position={pos1.clone().lerp(mid, 0.4)} center style={{ pointerEvents: "none" }}>
                <span style={{ fontSize: 10, color: baseColor(b1), background: "rgba(0,0,0,0.5)", borderRadius: 3, padding: "1px 3px" }}>
                  {examMode ? "?" : b1}
                </span>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}
