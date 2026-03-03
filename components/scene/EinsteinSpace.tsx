"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAppStore } from "@/src/store/appStore";
import { einsteinWarpVert, einsteinWarpFrag } from "@/src/shaders/einsteinWarp.glsl";

const GRID_GEO = new THREE.PlaneGeometry(60, 60, 48, 48);

function WarpMesh() {
  const { mass, warp, scale } = useAppStore((s) => s.einstein);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uMass: { value: mass },
      uWarp: { value: warp },
      uScale: { value: scale },
      uTime: { value: 0 }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime!.value = clock.getElapsedTime();
    matRef.current.uniforms.uMass!.value = mass;
    matRef.current.uniforms.uWarp!.value = warp;
    matRef.current.uniforms.uScale!.value = scale;
  });

  return (
    <mesh geometry={GRID_GEO} position={[0, -18, -5]} rotation={[-Math.PI / 2.8, 0, 0]}>
      <shaderMaterial
        ref={matRef}
        vertexShader={einsteinWarpVert}
        fragmentShader={einsteinWarpFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        wireframe={false}
      />
    </mesh>
  );
}

function Geodesics({ mass, scale }: { mass: number; scale: number }) {
  const lineObjects = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({ color: "#4f46e5", transparent: true, opacity: 0.35 });
    const SEGS = 80;
    const out: THREE.Line[] = [];
    for (let g = 0; g < 6; g++) {
      const startAngle = (g / 6) * Math.PI * 2;
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i < SEGS; i++) {
        const t = i / (SEGS - 1);
        const x = Math.cos(startAngle + t * Math.PI * 0.8) * (28 * scale - mass * 4 * t);
        const z = Math.sin(startAngle + t * Math.PI * 0.8) * (28 * scale - mass * 4 * t);
        const y = -18 - t * t * mass * 3;
        pts.push(new THREE.Vector3(x, y, z));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      out.push(new THREE.Line(geo, mat));
    }
    return out;
  }, [mass, scale]);

  return (
    <>
      {lineObjects.map((obj, i) => (
        <primitive key={i} object={obj} />
      ))}
    </>
  );
}

export default function EinsteinSpace() {
  const { mass, warp, scale, showGeodesics } = useAppStore((s) => s.einstein);

  return (
    <group>
      <WarpMesh />
      {showGeodesics && <Geodesics mass={mass} scale={scale} />}
    </group>
  );
}
