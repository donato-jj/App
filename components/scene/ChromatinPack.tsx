"use client";

import { useEffect, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAppStore } from "@/src/store/appStore";

const NUCLEOSOME_GEO = new THREE.CylinderGeometry(0.55, 0.55, 0.3, 12);
const HISTONE_MAT = new THREE.MeshStandardMaterial({ color: "#a78bfa", roughness: 0.45, metalness: 0.1 });

function NucleosomeLevel({ count, radius }: { count: number; radius: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      dummy.position.set(Math.cos(angle) * radius, (i - count / 2) * 0.7, Math.sin(angle) * radius);
      dummy.rotation.z = Math.PI / 2;
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count, radius]);

  return (
    <instancedMesh ref={meshRef} args={[NUCLEOSOME_GEO, HISTONE_MAT, count]}>
      <meshStandardMaterial color="#a78bfa" roughness={0.45} metalness={0.1} />
    </instancedMesh>
  );
}

export default function ChromatinPack() {
  const packLevel = useAppStore((s) => s.pack.level);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.15;
  });

  if (packLevel < 20) return null;

  const t = packLevel / 100;

  // Level 0-50: nucleosomes; 50-80: fiber; 80-100: abstract chromosome
  const showNucleosomes = packLevel >= 20 && packLevel < 80;
  const showFiber = packLevel >= 60 && packLevel < 90;
  const showChromosome = packLevel >= 85;

  const nucleosomeOpacity = showNucleosomes ? Math.min(1, (packLevel - 20) / 30) : 0;
  const fiberOpacity = showFiber ? Math.min(1, (packLevel - 60) / 20) : 0;
  const chrOpacity = showChromosome ? Math.min(1, (packLevel - 85) / 15) : 0;

  const nucleosomeCount = Math.min(24, Math.floor(4 + t * 20));

  return (
    <group ref={groupRef}>
      {/* Nucleosomes */}
      {showNucleosomes && (
        <group>
          <NucleosomeLevel count={nucleosomeCount} radius={2.2} />
          {/* DNA wrapping line around nucleosomes */}
          {Array.from({ length: nucleosomeCount }).map((_, i) => {
            const angle = (i / nucleosomeCount) * Math.PI * 2;
            const x = Math.cos(angle) * 2.2;
            const y = (i - nucleosomeCount / 2) * 0.7;
            const z = Math.sin(angle) * 2.2;
            return (
              <mesh key={i} position={[x, y, z]}>
                <torusGeometry args={[0.62, 0.04, 6, 16]} />
                <meshStandardMaterial
                  color="#e5e7eb"
                  transparent
                  opacity={nucleosomeOpacity * 0.7}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Fiber (30nm fiber abstraction) */}
      {showFiber && (
        <group>
          {Array.from({ length: 10 }).map((_, i) => {
            const y = (i - 5) * 1.2;
            const r = 3.2 + Math.sin(i * 1.2) * 0.5;
            return (
              <mesh key={i} position={[0, y, 0]}>
                <torusGeometry args={[r, 0.15, 6, 20]} />
                <meshStandardMaterial
                  color="#818cf8"
                  transparent
                  opacity={fiberOpacity * 0.65}
                  roughness={0.5}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Abstract chromosome */}
      {showChromosome && (
        <group>
          <mesh position={[0, 0, 0]}>
            <capsuleGeometry args={[1.2, 7, 10, 20]} />
            <meshStandardMaterial
              color="#6366f1"
              transparent
              opacity={chrOpacity * 0.8}
              roughness={0.35}
              metalness={0.15}
            />
          </mesh>
          <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
            <capsuleGeometry args={[0.35, 2, 6, 12]} />
            <meshStandardMaterial
              color="#a5b4fc"
              transparent
              opacity={chrOpacity * 0.6}
              roughness={0.4}
            />
          </mesh>
          <mesh position={[0, -0.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <capsuleGeometry args={[0.35, 2, 6, 12]} />
            <meshStandardMaterial
              color="#a5b4fc"
              transparent
              opacity={chrOpacity * 0.6}
              roughness={0.4}
            />
          </mesh>
          {/* Label */}
          <mesh position={[0, 5.5, 0]}>
            <sphereGeometry args={[0.05, 4, 4]} />
            <meshBasicMaterial color="transparent" />
          </mesh>
        </group>
      )}
    </group>
  );
}
