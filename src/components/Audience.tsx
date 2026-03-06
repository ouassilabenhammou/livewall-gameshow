"use client";

import { useMemo } from "react";
import * as THREE from "three";

const SKIN_TONES = ["#e8c4a0", "#c8956c", "#8b5e3c", "#f5deb3", "#d4956a"];
const SHIRT_COLORS = [
  "#c8ff00", // lime — Livewall
  "#f5f5e8", // off-white — Livewall
  "#1a1a1a", // black — Livewall
  "#c8ff00",
  "#f5f5e8",
  "#3a3a3a",
  "#c8e000",
  "#e8e8d8",
];

interface AudiencePerson {
  x: number;
  y: number;
  z: number;
  skin: string;
  shirt: string;
  scale: number;
}

function Person({ x, y, z, skin, shirt, scale }: AudiencePerson) {
  return (
    <group position={[x, y, z]} scale={[scale, scale, scale]}>
      {/* Head */}
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.22, 0.22, 0.16]} />
        <meshStandardMaterial color={skin} roughness={0.8} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.055, 0.295, 0.085]}>
        <boxGeometry args={[0.04, 0.03, 0.02]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0.055, 0.295, 0.085]}>
        <boxGeometry args={[0.04, 0.03, 0.02]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Body/Shoulders */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.32, 0.22, 0.14]} />
        <meshStandardMaterial color={shirt} roughness={0.9} />
      </mesh>
      {/* Lower body (seated, clipped by floor) */}
      <mesh position={[0, -0.04, 0]}>
        <boxGeometry args={[0.28, 0.12, 0.18]} />
        <meshStandardMaterial color="#222" roughness={0.9} />
      </mesh>
    </group>
  );
}

export default function Audience() {
  const people = useMemo<AudiencePerson[]>(() => {
    const list: AudiencePerson[] = [];

    const rows = [
      { z: 5.0, y: 0.0, count: 14, xFrom: -7.5, xTo: 7.5 },
      { z: 5.9, y: 0.3, count: 13, xFrom: -7.0, xTo: 7.0 },
      { z: 6.8, y: 0.6, count: 12, xFrom: -6.5, xTo: 6.5 },
      { z: 7.6, y: 0.9, count: 11, xFrom: -6.0, xTo: 6.0 },
    ];

    rows.forEach((row, rowIdx) => {
      const step = (row.xTo - row.xFrom) / (row.count - 1);
      for (let i = 0; i < row.count; i++) {
        const x = row.xFrom + i * step;

        // Stable pseudo-random via index
        const seed = rowIdx * 100 + i;
        const skinIdx = seed % SKIN_TONES.length;
        const shirtIdx = (seed * 3 + rowIdx) % SHIRT_COLORS.length;
        const scale = 0.88 + ((seed * 7) % 10) * 0.012;

        list.push({
          x,
          y: row.y,
          z: row.z,
          skin: SKIN_TONES[skinIdx],
          shirt: SHIRT_COLORS[shirtIdx],
          scale,
        });
      }
    });

    return list;
  }, []);

  return (
    <group>
      {/* Audience riser steps */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, i * 0.28 - 0.01, 5.2 + i * 0.88]}
        >
          <planeGeometry args={[18, 1.2]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.7} />
        </mesh>
      ))}

      {/* Riser vertical faces */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={`rv-${i}`} position={[0, i * 0.28 + 0.13, 5.2 + i * 0.88]}>
          <boxGeometry args={[18, 0.28, 0.04]} />
          <meshStandardMaterial color="#080808" roughness={0.8} />
        </mesh>
      ))}

      {/* Riser lime edge strip */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={`re-${i}`} position={[0, i * 0.28 + 0.01, 4.95 + i * 0.88]}>
          <boxGeometry args={[18, 0.03, 0.05]} />
          <meshStandardMaterial
            color="#c8ff00"
            emissive="#c8ff00"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {people.map((p, i) => (
        <Person key={i} {...p} />
      ))}
    </group>
  );
}
