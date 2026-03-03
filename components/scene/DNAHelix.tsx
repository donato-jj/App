"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useAppStore } from "@/src/store/appStore";
import { baseColor, backboneColor } from "@/src/lib/colors";
import { complement } from "@/src/lib/dna";
import type { Base } from "@/src/types/app";

const BASES: Base[] = ["A", "T", "C", "G"];

function getBase(seq: string, i: number): Base {
  const ch = seq[i % seq.length];
  if (ch === "A" || ch === "T" || ch === "C" || ch === "G") return ch as Base;
  return BASES[i % 4]!;
}

/* Build helix geometry data */
function buildHelixData(
  pairs: number,
  radius: number,
  pitch: number,
  separation: number,
  seq: string
) {
  const strand1: THREE.Vector3[] = [];
  const strand2: THREE.Vector3[] = [];
  const bases1: { pos: THREE.Vector3; base: Base; idx: number }[] = [];
  const bases2: { pos: THREE.Vector3; base: Base; idx: number }[] = [];
  const backbonePositions: THREE.Vector3[] = [];

  const turns = pairs / 10.4; // ~10.4 bp per turn in B-DNA
  const height = pitch * pairs;

  for (let i = 0; i < pairs; i++) {
    const t = i / (pairs - 1);
    const angle = t * turns * Math.PI * 2;
    const y = t * height - height / 2;

    const x1 = Math.cos(angle) * radius;
    const z1 = Math.sin(angle) * radius;
    const x2 = Math.cos(angle + Math.PI) * radius;
    const z2 = Math.sin(angle + Math.PI) * radius;

    const p1 = new THREE.Vector3(x1, y, z1);
    const p2 = new THREE.Vector3(x2, y, z2);
    strand1.push(p1);
    strand2.push(p2);

    // Base sphere positions (closer to center)
    const bFrac = 0.55;
    const bp1 = new THREE.Vector3(x1 * bFrac, y, z1 * bFrac);
    const bp2 = new THREE.Vector3(x2 * bFrac, y, z2 * bFrac);

    const base = getBase(seq, i);
    bases1.push({ pos: bp1, base, idx: i });
    bases2.push({ pos: bp2, base: complement(base), idx: i });

    backbonePositions.push(p1, p2);
  }

  return { strand1, strand2, bases1, bases2, backbonePositions };
}

export default function DNAHelix() {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const dna = useAppStore((s) => s.dna);
  const pack = useAppStore((s) => s.pack.level);
  const isMob = useAppStore((s) => s.perf.isMobileHint);

  const { pairs, radius, pitch, separation, rotateSpeed, breathing, showLabels, examMode, sequence } = dna;

  // Reduce complexity on mobile
  const effectivePairs = isMob ? Math.min(pairs, 60) : pairs;

  const { strand1, strand2, bases1, bases2 } = useMemo(
    () => buildHelixData(effectivePairs, radius, pitch, separation, sequence),
    [effectivePairs, radius, pitch, separation, sequence]
  );

  // Instanced mesh for backbone spheres
  const backboneRef1 = useRef<THREE.InstancedMesh>(null);
  const backboneRef2 = useRef<THREE.InstancedMesh>(null);
  const base1Ref = useRef<THREE.InstancedMesh>(null);
  const base2Ref = useRef<THREE.InstancedMesh>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Update backbone instance matrices
  useMemo(() => {
    if (!backboneRef1.current || !backboneRef2.current) return;
    strand1.forEach((pos, i) => {
      dummy.position.copy(pos);
      dummy.scale.setScalar(0.08);
      dummy.updateMatrix();
      backboneRef1.current!.setMatrixAt(i, dummy.matrix);
    });
    backboneRef1.current.instanceMatrix.needsUpdate = true;

    strand2.forEach((pos, i) => {
      dummy.position.copy(pos);
      dummy.scale.setScalar(0.08);
      dummy.updateMatrix();
      backboneRef2.current!.setMatrixAt(i, dummy.matrix);
    });
    backboneRef2.current.instanceMatrix.needsUpdate = true;
  }, [strand1, strand2, dummy]);

  // Base sphere colors and positions
  const base1Colors = useMemo(() => {
    const colors = new Float32Array(bases1.length * 3);
    bases1.forEach(({ base }, i) => {
      const c = new THREE.Color(examMode ? "#888888" : baseColor(base));
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    });
    return colors;
  }, [bases1, examMode]);

  const base2Colors = useMemo(() => {
    const colors = new Float32Array(bases2.length * 3);
    bases2.forEach(({ base }, i) => {
      const c = new THREE.Color(examMode ? "#888888" : baseColor(base));
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    });
    return colors;
  }, [bases2, examMode]);

  useMemo(() => {
    if (!base1Ref.current || !base2Ref.current) return;
    bases1.forEach(({ pos }, i) => {
      dummy.position.copy(pos);
      dummy.scale.setScalar(0.12);
      dummy.updateMatrix();
      base1Ref.current!.setMatrixAt(i, dummy.matrix);
      base1Ref.current!.setColorAt(i, new THREE.Color(
        base1Colors[i * 3], base1Colors[i * 3 + 1], base1Colors[i * 3 + 2]
      ));
    });
    base1Ref.current.instanceMatrix.needsUpdate = true;
    if (base1Ref.current.instanceColor) base1Ref.current.instanceColor.needsUpdate = true;

    bases2.forEach(({ pos }, i) => {
      dummy.position.copy(pos);
      dummy.scale.setScalar(0.12);
      dummy.updateMatrix();
      base2Ref.current!.setMatrixAt(i, dummy.matrix);
      base2Ref.current!.setColorAt(i, new THREE.Color(
        base2Colors[i * 3], base2Colors[i * 3 + 1], base2Colors[i * 3 + 2]
      ));
    });
    base2Ref.current.instanceMatrix.needsUpdate = true;
    if (base2Ref.current.instanceColor) base2Ref.current.instanceColor.needsUpdate = true;
  }, [bases1, bases2, dummy, base1Colors, base2Colors]);

  // Build backbone tube curve
  const curve1 = useMemo(() => new THREE.CatmullRomCurve3(strand1), [strand1]);
  const curve2 = useMemo(() => new THREE.CatmullRomCurve3(strand2), [strand2]);
  const tubeSegs = isMob ? 60 : 120;
  const tube1Geo = useMemo(() => new THREE.TubeGeometry(curve1, tubeSegs, 0.025, 6, false), [curve1, tubeSegs]);
  const tube2Geo = useMemo(() => new THREE.TubeGeometry(curve2, tubeSegs, 0.025, 6, false), [curve2, tubeSegs]);

  // Build base-pair connector geometry
  const connectorGeo = useMemo(() => {
    const positions: number[] = [];
    bases1.forEach(({ pos }, i) => {
      const pos2 = bases2[i]?.pos;
      if (!pos2) return;
      positions.push(pos.x, pos.y, pos.z, pos2.x, pos2.y, pos2.z);
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [bases1, bases2]);

  // Animation
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // Only rotate if pack < 20
    const packFactor = Math.max(0, 1 - pack / 20);
    groupRef.current.rotation.y += rotateSpeed * delta * packFactor;
    // Breathing
    const bScale = 1 + Math.sin(Date.now() * 0.001) * breathing * 0.04;
    groupRef.current.scale.setScalar(bScale);
  });

  // Hide when pack > 60
  const opacity = pack > 60 ? Math.max(0, 1 - (pack - 60) / 20) : 1;

  if (opacity <= 0) return null;

  return (
    <group ref={groupRef}>
      {/* Backbone tubes */}
      <mesh geometry={tube1Geo}>
        <meshStandardMaterial color={backboneColor} roughness={0.4} metalness={0.3} transparent opacity={opacity} />
      </mesh>
      <mesh geometry={tube2Geo}>
        <meshStandardMaterial color={backboneColor} roughness={0.4} metalness={0.3} transparent opacity={opacity} />
      </mesh>

      {/* Base-pair connectors */}
      <lineSegments geometry={connectorGeo}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.25 * opacity} />
      </lineSegments>

      {/* Base spheres strand 1 */}
      <instancedMesh ref={base1Ref} args={[undefined, undefined, bases1.length]}>
        <sphereGeometry args={[1, isMob ? 6 : 8, isMob ? 6 : 8]} />
        <meshStandardMaterial roughness={0.3} metalness={0.1} transparent opacity={opacity} vertexColors />
      </instancedMesh>

      {/* Base spheres strand 2 */}
      <instancedMesh ref={base2Ref} args={[undefined, undefined, bases2.length]}>
        <sphereGeometry args={[1, isMob ? 6 : 8, isMob ? 6 : 8]} />
        <meshStandardMaterial roughness={0.3} metalness={0.1} transparent opacity={opacity} vertexColors />
      </instancedMesh>

      {/* Backbone spheres */}
      <instancedMesh ref={backboneRef1} args={[undefined, undefined, strand1.length]}>
        <sphereGeometry args={[1, 5, 5]} />
        <meshStandardMaterial color={backboneColor} roughness={0.5} transparent opacity={0.7 * opacity} />
      </instancedMesh>
      <instancedMesh ref={backboneRef2} args={[undefined, undefined, strand2.length]}>
        <sphereGeometry args={[1, 5, 5]} />
        <meshStandardMaterial color={backboneColor} roughness={0.5} transparent opacity={0.7 * opacity} />
      </instancedMesh>

      {/* Labels */}
      {showLabels && !examMode && bases1.slice(0, Math.min(8, bases1.length)).map(({ pos, base, idx }) => (
        <Html key={idx} position={[pos.x + 0.2, pos.y, pos.z + 0.2]} style={{ pointerEvents: "none" }}>
          <div className="text-[9px] font-mono px-1 rounded" style={{ color: baseColor(base), background: "rgba(0,0,0,0.5)" }}>
            {base}
          </div>
        </Html>
      ))}

      {/* Hover tooltip */}
      {hoveredIdx !== null && bases1[hoveredIdx] && (
        <Html position={bases1[hoveredIdx]!.pos.toArray()} style={{ pointerEvents: "none" }}>
          <div className="bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-xs min-w-[120px]">
            <div className="font-semibold text-white">Par #{hoveredIdx + 1}</div>
            <div style={{ color: baseColor(bases1[hoveredIdx]!.base) }}>{bases1[hoveredIdx]!.base} – {complement(bases1[hoveredIdx]!.base)}</div>
            <div className="text-white/50 text-[10px] mt-1">Enlace hidrógeno</div>
          </div>
        </Html>
      )}

      {/* Invisible hit targets for hover */}
      {bases1.map(({ pos, idx }) => (
        <mesh
          key={`hit-${idx}`}
          position={pos.toArray()}
          onPointerEnter={() => setHoveredIdx(idx)}
          onPointerLeave={() => setHoveredIdx(null)}
        >
          <sphereGeometry args={[0.15, 4, 4]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
}
