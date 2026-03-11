"use client";

import { useMemo } from "react";

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

interface PersonProps {
  x: number;
  y: number;
  z: number;
  skin: string;
  shirt: string;
  scale: number;
  rotationY: number;
}

function Person({ x, y, z, skin, shirt, scale, rotationY }: PersonProps) {
  return (
    <group
      position={[x, y, z]}
      scale={[scale, scale, scale]}
      rotation={[0, rotationY, 0]}
    >
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
      {/* Lower body */}
      <mesh position={[0, -0.04, 0]}>
        <boxGeometry args={[0.28, 0.12, 0.18]} />
        <meshStandardMaterial color="#222" roughness={0.9} />
      </mesh>
    </group>
  );
}

// Each row steps further from the stage and rises in height
const SIDE_ROWS = [
  { dist: 5.0, y: 0.0, count: 9 },
  { dist: 5.9, y: 0.3, count: 8 },
  { dist: 6.8, y: 0.6, count: 7 },
  { dist: 7.6, y: 0.9, count: 6 },
];

// Z range alongside the stage
const Z_FROM = 1.0;
const Z_TO = 6.5;
const Z_CENTER = (Z_FROM + Z_TO) / 2;
const Z_SPAN = Z_TO - Z_FROM;

function SideSection({
  side,
  seedOffset,
}: {
  side: "left" | "right";
  seedOffset: number;
}) {
  const sign = side === "left" ? -1 : 1;
  // Left group faces +X (toward stage), right group faces -X (toward stage)
  const rotationY = side === "left" ? -Math.PI / 2 : Math.PI / 2;

  const people = useMemo<PersonProps[]>(() => {
    const list: PersonProps[] = [];
    SIDE_ROWS.forEach((row, rowIdx) => {
      const step = (Z_TO - Z_FROM) / (row.count - 1);
      for (let i = 0; i < row.count; i++) {
        const z = Z_FROM + i * step;
        const seed = seedOffset + rowIdx * 100 + i;
        list.push({
          x: sign * row.dist,
          y: row.y,
          z,
          skin: SKIN_TONES[seed % SKIN_TONES.length],
          shirt: SHIRT_COLORS[(seed * 3 + rowIdx) % SHIRT_COLORS.length],
          scale: 0.88 + ((seed * 7) % 10) * 0.012,
          rotationY,
        });
      }
    });
    return list;
  }, [sign, rotationY, seedOffset]);

  // Inner edge X (the edge closest to the stage)
  const innerEdgeX = (row: { dist: number }) => sign * (row.dist - 0.6);

  return (
    <group>
      {/* Riser horizontal steps */}
      {SIDE_ROWS.map((row, i) => (
        <mesh
          key={`step-${i}`}
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[sign * row.dist, row.y - 0, Z_CENTER]}
        >
          <planeGeometry args={[1.2, Z_SPAN + 1.0]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.7} />
        </mesh>
      ))}

      {/* Riser vertical faces (inner/stage-facing edge) */}
      {SIDE_ROWS.map((row, i) => (
        <mesh
          key={`vface-${i}`}
          position={[innerEdgeX(row), row.y + 0.13, Z_CENTER]}
        >
          <boxGeometry args={[0.04, 0.28, Z_SPAN + 1.0]} />
          <meshStandardMaterial color="#080808" roughness={0.8} />
        </mesh>
      ))}

      {/* Lime glow edge strip */}
      {SIDE_ROWS.map((row, i) => (
        <mesh
          key={`edge-${i}`}
          position={[innerEdgeX(row), row.y + 0.01, Z_CENTER]}
        >
          <boxGeometry args={[0.07, 0.03, Z_SPAN + 1.0]} />
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

export default function Audience() {
  return (
    <group>
      <SideSection side="left" seedOffset={0} />
      <SideSection side="right" seedOffset={1000} />
    </group>
  );
}
