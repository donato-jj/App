"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAppStore } from "@/src/store/appStore";
import { voidFieldVert, voidFieldFrag } from "@/src/shaders/voidField.glsl";

export default function VoidField() {
  const voidState = useAppStore((s) => s.voidField);
  const { intensity, mode, particleDensity } = voidState;
  const isMob = useAppStore((s) => s.perf.isMobileHint);

  if (mode === "particles") {
    return <VoidParticles intensity={intensity} density={particleDensity} isMob={isMob} />;
  }
  return <VoidShaderPlane intensity={intensity} />;
}

function VoidShaderPlane({ intensity }: { intensity: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: intensity },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((_, delta) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value += delta;
    matRef.current.uniforms.uIntensity.value = intensity;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -20]} rotation={[0, 0, 0]}>
      <planeGeometry args={[80, 60, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={voidFieldVert}
        fragmentShader={voidFieldFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

function VoidParticles({
  intensity,
  density,
  isMob,
}: {
  intensity: number;
  density: number;
  isMob: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = isMob ? 800 : Math.round(2000 * density);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 10;
      const c = new THREE.Color().setHSL(0.65 + Math.random() * 0.2, 0.7, 0.4 + Math.random() * 0.3);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: col };
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.03 * intensity;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.6 * intensity}
        depthWrite={false}
      />
    </points>
  );
}
