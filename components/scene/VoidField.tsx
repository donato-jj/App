"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAppStore } from "@/src/store/appStore";
import { voidFieldVert, voidFieldFrag } from "@/src/shaders/voidField.glsl";

function FieldPlane({ intensity }: { intensity: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: intensity },
    }),
    []
  );

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uIntensity.value = intensity;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -10]} rotation={[0, 0, 0]}>
      <planeGeometry args={[40, 40, 1, 1]} />
      <shaderMaterial
        vertexShader={voidFieldVert}
        fragmentShader={voidFieldFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

function FieldParticles({ intensity, density }: { intensity: number; density: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = Math.floor(500 + density * 1500);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = clock.elapsedTime * 0.02 * intensity;
    pointsRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.01) * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color={new THREE.Color(0.3, 0.1, 0.8).lerp(new THREE.Color(0.05, 0.3, 0.5), 1 - intensity)}
        transparent
        opacity={0.4 + intensity * 0.5}
        sizeAttenuation
      />
    </points>
  );
}

export default function VoidField() {
  const mode = useAppStore((s) => s.voidField.mode);
  const intensity = useAppStore((s) => s.voidField.intensity);
  const particleDensity = useAppStore((s) => s.voidField.particleDensity);

  if (mode === "particles") {
    return <FieldParticles intensity={intensity} density={particleDensity} />;
  }
  return <FieldPlane intensity={intensity} />;
}
