"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAppStore } from "@/src/store/appStore";

const PARTICLE_GEO = new THREE.SphereGeometry(0.09, 5, 5);
const ORGANELLE_GEO = new THREE.SphereGeometry(0.8, 10, 10);

export default function CellAssembly() {
  const isMobile = useAppStore((s) => s.perf.isMobileHint);
  const count = isMobile ? 120 : 300;
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const initialData = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    const targets: THREE.Vector3[] = [];
    const speeds: number[] = [];
    const MEMBRANE_R = 14;
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 6 + Math.random() * 10;
      positions.push(
        new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        )
      );
      // Target: on membrane sphere
      const tr = MEMBRANE_R * (0.88 + Math.random() * 0.24);
      targets.push(
        new THREE.Vector3(
          tr * Math.sin(phi) * Math.cos(theta),
          tr * Math.sin(phi) * Math.sin(theta),
          tr * Math.cos(phi)
        )
      );
      speeds.push(0.3 + Math.random() * 0.7);
    }
    return { positions, targets, speeds };
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const { positions, targets, speeds } = initialData;
    for (let i = 0; i < count; i++) {
      const pos = positions[i]!;
      const tgt = targets[i]!;
      const spd = speeds[i]!;
      const wave = Math.sin(t * spd + i) * 0.12;
      dummy.position.lerpVectors(pos, tgt, 0.5 + Math.sin(t * 0.1 + i * 0.1) * 0.3);
      dummy.position.y += wave;
      dummy.scale.setScalar(0.7 + Math.sin(t * spd * 0.5 + i) * 0.3);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (groupRef.current) groupRef.current.rotation.y += 0.001;
  });

  return (
    <group ref={groupRef} position={[0, 0, -8]}>
      {/* Membrane */}
      <mesh>
        <sphereGeometry args={[14, isMobile ? 16 : 28, isMobile ? 16 : 28]} />
        <meshStandardMaterial
          color="#0891b2"
          transparent
          opacity={0.06}
          roughness={0.3}
          side={THREE.FrontSide}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[14.2, isMobile ? 16 : 24, isMobile ? 16 : 24]} />
        <meshStandardMaterial
          color="#06b6d4"
          transparent
          opacity={0.04}
          wireframe
          side={THREE.FrontSide}
          depthWrite={false}
        />
      </mesh>

      {/* Organelles */}
      {[
        { pos: [2, 0.5, 0] as [number, number, number], color: "#fbbf24", label: "Núcleo (abs.)" },
        { pos: [-3, 1, 1] as [number, number, number], color: "#34d399", label: "Mitocondria (abs.)" },
        { pos: [4, -1.5, -2] as [number, number, number], color: "#a78bfa", label: "Retículo (abs.)" }
      ].map((o, i) => (
        <mesh key={i} position={o.pos}>
          <sphereGeometry args={[0.7 + i * 0.2, 10, 10]} />
          <meshStandardMaterial color={o.color} transparent opacity={0.55} roughness={0.35} metalness={0.05} />
        </mesh>
      ))}

      {/* Particles */}
      <instancedMesh ref={meshRef} args={[PARTICLE_GEO, undefined, count]}>
        <meshStandardMaterial color="#7dd3fc" transparent opacity={0.55} roughness={0.6} />
      </instancedMesh>
    </group>
  );
}
