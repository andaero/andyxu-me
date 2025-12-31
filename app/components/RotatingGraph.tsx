"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const NODE_COUNT = 80;
const RADIUS = 3.5;
const CONNECTION_DIST = 2.2;
const MIN_CONNECTIONS = 6;


function generateGraphData() {
  const nodes = new Float32Array(NODE_COUNT * 3);
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes[i * 3] = (Math.random() - 0.5) * RADIUS * 2.5;
    nodes[i * 3 + 1] = (Math.random() - 0.5) * RADIUS * 1.5;
    nodes[i * 3 + 2] = (Math.random() - 0.5) * RADIUS * 2.5;
  }

  const connections: number[] = [];
  const connectedPairs = new Set<string>();
  const distSqThreshold = CONNECTION_DIST * CONNECTION_DIST;

  for (let i = 0; i < NODE_COUNT; i++) {
    const neighbors: { index: number; distSq: number }[] = [];

    for (let j = 0; j < NODE_COUNT; j++) {
      if (i === j) continue;
      const dx = nodes[i * 3] - nodes[j * 3];
      const dy = nodes[i * 3 + 1] - nodes[j * 3 + 1];
      const dz = nodes[i * 3 + 2] - nodes[j * 3 + 2];
      const distSq = dx * dx + dy * dy + dz * dz;
      neighbors.push({ index: j, distSq });
    }

    // Sort to find the nearest neighbors for the MIN_CONNECTIONS requirement
    neighbors.sort((a, b) => a.distSq - b.distSq);

    for (let k = 0; k < neighbors.length; k++) {
      const { index: j, distSq } = neighbors[k];
      
      // Connect if it's one of the nearest MIN_CONNECTIONS, or within the threshold
      if (k < MIN_CONNECTIONS || distSq < distSqThreshold) {
        const pairId = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!connectedPairs.has(pairId)) {
          connectedPairs.add(pairId);
          connections.push(
            nodes[i * 3], nodes[i * 3 + 1], nodes[i * 3 + 2],
            nodes[j * 3], nodes[j * 3 + 1], nodes[j * 3 + 2]
          );
        }
      } else if (k >= MIN_CONNECTIONS) {
        break;
      }
    }
  }
  return { nodes, lines: new Float32Array(connections) };
}

function NetworkGraph({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null);

  const { nodes, lines } = useMemo(() => generateGraphData(), []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position" 
            args={[nodes, 3]} 
          />
        </bufferGeometry>
        <pointsMaterial color={color} size={0.12} sizeAttenuation transparent opacity={0.8} />
      </points>

      <lineSegments>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position" 
            args={[lines, 3]} 
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.3} />
      </lineSegments>
    </group>
  );
}

export default function RotatingGraph() {
  const [colors, setColors] = useState({ primary: "#362c4e", background: "#eeeee2" });

  useEffect(() => {
    // Using requestAnimationFrame to move setState out of the synchronous effect execution
    // to satisfy the linter and prevent cascading renders.
    const frameId = requestAnimationFrame(() => {
      const style = getComputedStyle(document.documentElement);
      const primary = style.getPropertyValue("--primary").trim();
      const background = style.getPropertyValue("--background").trim();

      if (primary || background) {
        setColors({
          primary: primary || "#362c4e",
          background: background || "#eeeee2",
        });
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="w-full h-full relative" style={{ backgroundColor: colors.background }}>
      <Canvas
        camera={{ position: [15, 10, 15], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={[colors.background]} />
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <NetworkGraph color={colors.primary} />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} enablePan={false} />
      </Canvas>
    </div>
  );
}
