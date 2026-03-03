"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAppStore } from "@/src/store/appStore";
import { smoothstep } from "@/src/lib/math";

function Nucleosomes({ opacity }: { opacity: number }) {
  const geo = useMemo(() => new THREE.SphereGeometry(0.4, 8, 8), []);
  const mat = useMemo(() => new THREE.MeshPhongMaterial({ color: "#a78bfa", transparent: true, opacity }), [opacity]);
  const positions = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * 2, (i % 2 === 0 ? 0.3 : -0.3), Math.sin(angle) * 2));
    }
    return pts;
  }, []);
  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={i} geometry={geo} material={mat} position={p} />
      ))}
    </group>
  );
}

function SolenoidFiber({ opacity }: { opacity: number }) {
  const geo = useMemo(() => new THREE.SphereGeometry(0.35, 8, 8), []);
  const mat = useMemo(() => new THREE.MeshPhongMaterial({ color: "#34d399", transparent: true, opacity }), [opacity]);
  const positions = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 4;
      const y = (i / 17) * 4 - 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * 1.8, y, Math.sin(angle) * 1.8));
    }
    return pts;
  }, []);
  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={i} geometry={geo} material={mat} position={p} />
      ))}
    </group>
  );
}

function LoopedDomains({ opacity }: { opacity: number }) {
  const geo = useMemo(() => new THREE.TorusGeometry(1.5, 0.25, 8, 20), []);
  const mat = useMemo(() => new THREE.MeshPhongMaterial({ color: "#fbbf24", transparent: true, opacity }), [opacity]);
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <mesh key={i} geometry={geo} material={mat} rotation={[Math.PI / 2, (i * Math.PI) / 3, 0]} position={[0, (i - 1) * 1.2, 0]} />
      ))}
    </group>
  );
}

function ChromosomeShape({ opacity }: { opacity: number }) {
  const geo = useMemo(() => new THREE.CapsuleGeometry(0.5, 2.5, 8, 12), []);
  const mat = useMemo(() => new THREE.MeshPhongMaterial({ color: "#f472b6", transparent: true, opacity }), [opacity]);
  return (
    <group>
      <mesh geometry={geo} material={mat} position={[-0.6, 0, 0]} rotation={[0, 0, 0.3]} />
      <mesh geometry={geo} material={mat} position={[0.6, 0, 0]} rotation={[0, 0, -0.3]} />
    </group>
  );
}

export default function ChromatinPack() {
  const level = useAppStore((s) => s.pack.level);

  const nucleosomeOpacity = smoothstep(20, 40, level) * (1 - smoothstep(55, 65, level));
  const solenoidOpacity = smoothstep(40, 60, level) * (1 - smoothstep(75, 85, level));
  const loopOpacity = smoothstep(60, 80, level) * (1 - smoothstep(88, 95, level));
  const chromoOpacity = smoothstep(80, 100, level);

  return (
    <group>
      {nucleosomeOpacity > 0 && <Nucleosomes opacity={nucleosomeOpacity} />}
      {solenoidOpacity > 0 && <SolenoidFiber opacity={solenoidOpacity} />}
      {loopOpacity > 0 && <LoopedDomains opacity={loopOpacity} />}
      {chromoOpacity > 0 && <ChromosomeShape opacity={chromoOpacity} />}
    </group>
  );
}
