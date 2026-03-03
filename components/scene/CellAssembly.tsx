"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useAppStore } from "@/src/store/appStore";

const ORGANELLE_DATA = [
  { color: "#34d399", rx: 0.8, ry: 0.5, rz: 0.5, pos: [2, 0.5, 1] as [number, number, number] },
  { color: "#fbbf24", rx: 0.6, ry: 0.4, rz: 0.6, pos: [-2, -0.5, 0.5] as [number, number, number] },
  { color: "#f472b6", rx: 1.0, ry: 0.3, rz: 0.6, pos: [0.5, 1, -2] as [number, number, number] },
  { color: "#7dd3fc", rx: 0.5, ry: 0.5, rz: 0.8, pos: [-1.5, 0.8, -1] as [number, number, number] },
];

function OrbitingParticles() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = 200;
  const geo = useMemo(() => new THREE.SphereGeometry(0.04, 4, 4), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#a78bfa", transparent: true, opacity: 0.6 }), []);

  const data = useMemo(() => {
    return Array.from({ length: count }, () => ({
      radius: 2 + Math.random() * 3.5,
      speed: 0.1 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
      tilt: (Math.random() - 0.5) * Math.PI,
      yOffset: (Math.random() - 0.5) * 4,
    }));
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    data.forEach((d, i) => {
      const angle = d.phase + t * d.speed;
      dummy.position.set(
        Math.cos(angle) * d.radius,
        d.yOffset + Math.sin(angle * 0.5) * 0.5,
        Math.sin(angle) * d.radius
      );
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geo, mat, count]} />;
}

export default function CellAssembly() {
  const memGeo = useMemo(() => new THREE.SphereGeometry(6, 32, 32), []);
  const memMat = useMemo(
    () => new THREE.MeshPhongMaterial({ color: "#4f46e5", transparent: true, opacity: 0.15, side: THREE.DoubleSide }),
    []
  );
  const nucGeo = useMemo(() => new THREE.SphereGeometry(1.5, 16, 16), []);
  const nucMat = useMemo(
    () => new THREE.MeshPhongMaterial({ color: "#a78bfa", transparent: true, opacity: 0.5 }),
    []
  );

  return (
    <group>
      {/* Outer membrane */}
      <mesh geometry={memGeo} material={memMat} />
      {/* Nucleus */}
      <mesh geometry={nucGeo} material={nucMat} />
      {/* Organelles */}
      {ORGANELLE_DATA.map((o, i) => (
        <mesh key={i} position={o.pos} scale={[o.rx, o.ry, o.rz]}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshPhongMaterial color={o.color} transparent opacity={0.55} />
        </mesh>
      ))}
      {/* Orbiting particles */}
      <OrbitingParticles />
      {/* Label */}
      <Html position={[0, 7, 0]} center style={{ pointerEvents: "none" }}>
        <div style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.7)",
          background: "rgba(0,0,0,0.5)",
          borderRadius: 6,
          padding: "3px 8px",
          border: "1px solid rgba(255,255,255,0.1)",
          whiteSpace: "nowrap"
        }}>
          Modelo visual simplificado
        </div>
      </Html>
    </group>
  );
}
