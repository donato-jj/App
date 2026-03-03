"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAppStore } from "@/src/store/appStore";
import { einsteinWarpVert, einsteinWarpFrag } from "@/src/shaders/einsteinWarp.glsl";

function GeodesicLines({ mass, warp }: { mass: number; warp: number }) {
  const lines = useMemo(() => {
    const result: THREE.BufferGeometry[] = [];
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const pts: THREE.Vector3[] = [];
      for (let j = 0; j <= 40; j++) {
        const t = j / 40;
        const r = t * 13;
        const curve = mass * warp * 0.3 * (1 / (r + 0.5));
        const x = Math.cos(angle + curve) * r;
        const z = Math.sin(angle + curve) * r;
        pts.push(new THREE.Vector3(x, 0.01, z));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      result.push(geo);
    }
    return result;
  }, [mass, warp]);

  return (
    <group>
      {lines.map((geo, i) => (
        <primitive key={i} object={new THREE.Line(geo, new THREE.LineBasicMaterial({ color: "#4f46e5", transparent: true, opacity: 0.5 }))} />
      ))}
    </group>
  );
}

export default function EinsteinSpace() {
  const meshRef = useRef<THREE.Mesh>(null);
  const einstein = useAppStore((s) => s.einstein);
  const { mass, warp, scale, showGeodesics } = einstein;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMass: { value: mass },
      uWarp: { value: warp },
      uScale: { value: scale },
    }),
    []
  );

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uMass.value = mass;
    uniforms.uWarp.value = warp;
    uniforms.uScale.value = scale;
  });

  return (
    <group>
      <mesh ref={meshRef} position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30, 60, 60]} />
        <shaderMaterial
          vertexShader={einsteinWarpVert}
          fragmentShader={einsteinWarpFrag}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
      {showGeodesics && (
        <group position={[0, -4.9, 0]}>
          <GeodesicLines mass={mass} warp={warp} />
        </group>
      )}
    </group>
  );
}
