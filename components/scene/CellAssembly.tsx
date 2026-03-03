"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useAppStore } from "@/src/store/appStore";

/* CellAssembly: membrane sphere + abstract organelles + converging particles */

export default function CellAssembly() {
  const pack = useAppStore((s) => s.pack.level);
  const isMob = useAppStore((s) => s.perf.isMobileHint);

  // Only show at high pack levels (cell level)
  const opacity = pack < 70 ? 0 : Math.min(1, (pack - 70) / 15);
  if (opacity <= 0) return null;

  return (
    <group position={[8, 0, -5]}>
      {/* Membrane */}
      <mesh>
        <sphereGeometry args={[5, isMob ? 16 : 32, isMob ? 16 : 32]} />
        <meshStandardMaterial
          color="#1d4ed8"
          roughness={0.8}
          metalness={0.1}
          transparent
          opacity={0.12 * opacity}
          side={THREE.FrontSide}
          depthWrite={false}
        />
      </mesh>
      {/* Membrane outline */}
      <mesh>
        <sphereGeometry args={[5.05, 24, 24]} />
        <meshStandardMaterial
          color="#60a5fa"
          roughness={0.5}
          wireframe
          transparent
          opacity={0.08 * opacity}
          depthWrite={false}
        />
      </mesh>

      {/* Organelles */}
      <Organelle pos={[0, 0, 0]} radius={0.9} color="#7c3aed" opacity={opacity} label="Núcleo (modelo)" />
      <Organelle pos={[2, 1, 0.5]} radius={0.3} color="#10b981" opacity={opacity} label="Mit." />
      <Organelle pos={[-1.5, -1, 1]} radius={0.25} color="#f59e0b" opacity={opacity} label="" />
      <Organelle pos={[1, -2, -1]} radius={0.2} color="#f43f5e" opacity={opacity} label="" />

      {/* Converging particles */}
      <MembraneParticles opacity={opacity} isMob={isMob} />

      <Html position={[0, 6, 0]} style={{ pointerEvents: "none" }}>
        <div className="text-[9px] text-blue-200/60 bg-black/50 rounded px-2 py-1 border border-blue-400/10">
          Modelo visual simplificado — no representa bioquímica real
        </div>
      </Html>
    </group>
  );
}

function Organelle({
  pos,
  radius,
  color,
  opacity,
  label,
}: {
  pos: [number, number, number];
  radius: number;
  color: string;
  opacity: number;
  label: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = pos[1] + Math.sin(state.clock.elapsedTime * 0.5 + pos[0]) * 0.1;
    }
  });

  return (
    <mesh ref={ref} position={pos}>
      <sphereGeometry args={[radius, 12, 12]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.3} transparent opacity={0.8 * opacity} />
      {label ? (
        <Html style={{ pointerEvents: "none" }}>
          <div className="text-[8px] text-white/60 whitespace-nowrap">{label}</div>
        </Html>
      ) : null}
    </mesh>
  );
}

function MembraneParticles({ opacity, isMob }: { opacity: number; isMob: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = isMob ? 200 : 500;
  const phase = useRef(Math.random() * Math.PI * 2);

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 8;
      const theta = Math.random() * Math.PI;
      const phi = Math.random() * Math.PI * 2;
      pos[i * 3] = r * Math.sin(theta) * Math.cos(phi);
      pos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      pos[i * 3 + 2] = r * Math.cos(theta);
      // Velocity toward center
      vel[i * 3] = -pos[i * 3] * 0.002;
      vel[i * 3 + 1] = -pos[i * 3 + 1] * 0.002;
      vel[i * 3 + 2] = -pos[i * 3 + 2] * 0.002;
    }
    return { positions: pos, velocities: vel };
  }, [count]);

  const posRef = useRef(positions.slice());

  useFrame(() => {
    if (!pointsRef.current) return;
    const pos = posRef.current;
    const geo = pointsRef.current.geometry;
    const attr = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const x = pos[i * 3]! + velocities[i * 3]!;
      const y = pos[i * 3 + 1]! + velocities[i * 3 + 1]!;
      const z = pos[i * 3 + 2]! + velocities[i * 3 + 2]!;
      const r = Math.sqrt(x * x + y * y + z * z);
      if (r < 0.5) {
        // Reset to outer shell
        const rt = 5 + Math.random() * 4;
        const theta = Math.random() * Math.PI;
        const phi = Math.random() * Math.PI * 2;
        pos[i * 3] = rt * Math.sin(theta) * Math.cos(phi);
        pos[i * 3 + 1] = rt * Math.sin(theta) * Math.sin(phi);
        pos[i * 3 + 2] = rt * Math.cos(theta);
      } else {
        pos[i * 3] = x;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = z;
      }
      attr.setXYZ(i, pos[i * 3]!, pos[i * 3 + 1]!, pos[i * 3 + 2]!);
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[posRef.current, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#93c5fd"
        size={0.06}
        sizeAttenuation
        transparent
        opacity={0.5 * opacity}
        depthWrite={false}
      />
    </points>
  );
}
