"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useAppStore } from "@/src/store/appStore";
import { einsteinWarpVert, einsteinWarpFrag } from "@/src/shaders/einsteinWarp.glsl";

export default function EinsteinSpace() {
  const einstein = useAppStore((s) => s.einstein);
  const { mass, warp, scale, showGeodesics } = einstein;

  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMass: { value: mass },
      uWarp: { value: warp },
      uScale: { value: scale },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((_, delta) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value += delta;
    matRef.current.uniforms.uMass.value = mass;
    matRef.current.uniforms.uWarp.value = warp;
    matRef.current.uniforms.uScale.value = scale;
  });

  return (
    <group position={[0, -10, -15]}>
      <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]}>
        <planeGeometry args={[40, 40, 48, 48]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={einsteinWarpVert}
          fragmentShader={einsteinWarpFrag}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          wireframe={false}
        />
      </mesh>

      {/* Geodesic lines */}
      {showGeodesics && <GeodesicLines mass={mass} />}

      {/* Label */}
      <Html position={[0, 2, 5]} style={{ pointerEvents: "none" }}>
        <div className="text-[9px] text-yellow-200/70 bg-black/50 rounded px-2 py-1 border border-yellow-400/10 max-w-[200px]">
          Modelo didáctico inspirado en relatividad; no simulación científica exacta.
        </div>
      </Html>
    </group>
  );
}

function GeodesicLines({ mass }: { mass: number }) {
  const linesRef = useRef<THREE.Group>(null);

  const lineGeometries = useMemo(() => {
    const geos: THREE.BufferGeometry[] = [];
    const numLines = 6;
    for (let l = 0; l < numLines; l++) {
      const angle = (l / numLines) * Math.PI * 2;
      const pts: THREE.Vector3[] = [];
      const steps = 60;
      for (let i = 0; i < steps; i++) {
        const t = (i / (steps - 1)) * 2 - 1; // -1 to 1
        const x = t * 15 * Math.cos(angle);
        const z = t * 15 * Math.sin(angle);
        const r = Math.sqrt(x * x + z * z) + 0.01;
        const deflection = mass * 0.4 * (1 / (1 + r * 0.3));
        const y = -deflection * 1.5;
        pts.push(new THREE.Vector3(x, y, z));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      geos.push(new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)));
    }
    return geos;
  }, [mass]);

  useFrame((_, delta) => {
    if (linesRef.current) linesRef.current.rotation.y += delta * 0.05;
  });

  const lines = useMemo(() =>
    lineGeometries.map((geo) => {
      const mat = new THREE.LineBasicMaterial({ color: "#4ade80", transparent: true, opacity: 0.3 });
      return new THREE.Line(geo, mat);
    }),
  [lineGeometries]);

  return (
    <group ref={linesRef}>
      {lines.map((ln, i) => (
        <primitive key={i} object={ln} />
      ))}
    </group>
  );
}
