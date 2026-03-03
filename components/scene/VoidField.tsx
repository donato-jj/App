"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useAppStore } from "@/src/store/appStore";
import { voidFieldVert, voidFieldFrag } from "@/src/shaders/voidField.glsl";

const PLANE_GEO = new THREE.PlaneGeometry(80, 80, 1, 1);

function VoidShaderPlane({ intensity }: { intensity: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: intensity }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime!.value = clock.getElapsedTime();
    matRef.current.uniforms.uIntensity!.value = intensity;
  });

  return (
    <mesh geometry={PLANE_GEO} position={[0, 0, -28]} rotation={[0, 0, 0]}>
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

function VoidParticles({ intensity, density }: { intensity: number; density: number }) {
  const meshRef = useRef<THREE.Points>(null);
  const isMobile = useAppStore((s) => s.perf.isMobileHint);

  const count = Math.floor((isMobile ? 300 : 800) * density);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      const r = 0.1 + Math.random() * 0.3;
      const g = 0.05 + Math.random() * 0.15;
      const b = 0.3 + Math.random() * 0.5;
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }
    return { positions, colors };
  }, [count]);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.03 * intensity;
    meshRef.current.rotation.x = Math.sin(t * 0.02) * 0.05;
    const pos = meshRef.current.geometry.attributes.position!;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += Math.sin(t * 0.5 + i) * 0.001 * intensity;
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={meshRef} geometry={geo}>
      <pointsMaterial size={0.12} vertexColors transparent opacity={0.6 * intensity} sizeAttenuation />
    </points>
  );
}

export default function VoidField() {
  const { intensity, mode, particleDensity } = useAppStore((s) => s.voidField);

  return (
    <group>
      {mode === "field" ? (
        <VoidShaderPlane intensity={intensity} />
      ) : (
        <VoidParticles intensity={intensity} density={particleDensity} />
      )}
    </group>
  );
}
