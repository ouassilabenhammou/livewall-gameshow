"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PIXEL_SIZE = 0.13;

type CharacterType = "presenter" | "player";

interface PixelGrid {
  grid: (string | null)[][];
  colors: Record<string, string>;
}

// Presenter: dark suit with lime tie — Livewall brand
const PRESENTER: PixelGrid = {
  colors: {
    h: "#1a1a1a",   // dark hair
    s: "#e8c4a0",   // skin
    e: "#111111",   // eyes
    b: "#0d0d0d",   // black suit
    t: "#c8ff00",   // lime tie — Livewall brand color
    p: "#0a0a0a",   // black trousers
    f: "#080808",   // shoes
    c: "#1a1a1a",   // suit collar
  },
  grid: [
    [null, null, "h", "h", "h", "h", null, null],
    [null, "h", "h", "h", "h", "h", "h", null],
    [null, "h", "s", "s", "s", "s", "h", null],
    [null, null, "e", "s", "s", "e", null, null],
    [null, null, "s", "s", "s", "s", null, null],
    [null, null, null, "s", "s", null, null, null],
    [null, "c", "b", "b", "b", "b", "c", null],
    ["s", "b", "b", "t", "t", "b", "b", "s"],
    [null, "b", "b", "t", "b", "b", "b", null],
    [null, "b", "b", "b", "b", "b", "b", null],
    [null, null, "p", "p", "p", "p", null, null],
    [null, null, "p", "p", "p", "p", null, null],
    [null, null, "p", null, null, "p", null, null],
    [null, null, "f", null, null, "f", null, null],
  ],
};

// Player: casual shirt in off-white, dark hair
const PLAYER: PixelGrid = {
  colors: {
    h: "#5d4037",   // brown hair
    s: "#f0cda8",   // skin (slightly different from presenter)
    e: "#1a1a1a",   // eyes
    c: "#f5f5e8",   // off-white shirt — Livewall off-white
    p: "#2a2a2a",   // dark trousers
    f: "#111111",   // shoes
    a: "#c8c8b8",   // shirt shadow
  },
  grid: [
    [null, null, "h", "h", "h", "h", null, null],
    [null, "h", "h", "h", "h", "h", "h", null],
    [null, "s", "s", "s", "s", "s", "s", null],
    [null, null, "e", "s", "s", "e", null, null],
    [null, null, "s", "s", "s", "s", null, null],
    [null, null, null, "s", "s", null, null, null],
    [null, "c", "c", "c", "c", "c", "c", null],
    ["s", "c", "c", "c", "c", "c", "c", "s"],
    [null, "c", "a", "c", "c", "a", "c", null],
    [null, "c", "c", "c", "c", "c", "c", null],
    [null, null, "p", "p", "p", "p", null, null],
    [null, null, "p", "p", "p", "p", null, null],
    [null, null, "p", null, null, "p", null, null],
    [null, null, "f", null, null, "f", null, null],
  ],
};

const CHARACTER_DATA: Record<CharacterType, PixelGrid> = {
  presenter: PRESENTER,
  player: PLAYER,
};

interface Voxel {
  position: [number, number, number];
  color: string;
}

export default function PixelCharacter({
  type,
  position = [0, 0, 0],
}: {
  type: CharacterType;
  position?: [number, number, number];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const data = CHARACTER_DATA[type];

  const voxels: Voxel[] = useMemo(() => {
    const result: Voxel[] = [];
    const numRows = data.grid.length;
    const numCols = data.grid[0].length;

    data.grid.forEach((row, rowIdx) => {
      row.forEach((cell, colIdx) => {
        if (cell) {
          const x = (colIdx - numCols / 2 + 0.5) * PIXEL_SIZE;
          const y = (numRows - 1 - rowIdx) * PIXEL_SIZE;
          result.push({
            position: [x, y, 0],
            color: data.colors[cell],
          });
        }
      });
    });

    return result;
  }, [data]);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      const offset = type === "presenter" ? 0 : Math.PI * 0.6;
      groupRef.current.position.y =
        position[1] + Math.sin(t * 1.1 + offset) * 0.012;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {voxels.map((voxel, i) => (
        <mesh key={i} position={voxel.position} castShadow>
          <boxGeometry args={[PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE * 0.7]} />
          <meshStandardMaterial
            color={voxel.color}
            roughness={0.6}
            metalness={0.05}
          />
        </mesh>
      ))}
    </group>
  );
}
