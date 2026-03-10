"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Text, Html, useTexture } from "@react-three/drei";
import {
  Suspense,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import * as THREE from "three";
import CameraRig, { type GamePhase } from "./CameraRig";
import PixelCharacter from "./PixelCharacter";
import Audience from "./Audience";

// Kleuren
const LW_BLACK = "#00000";
const LW_OFF_WHITE = "#FAFDF9";
const LW_LIME = "#D1FF00";

const TURN_ANGLE = Math.PI / 9;

// ─── TV screen — shows question text during game ─────────────────────────────

function TVScreenLogo() {
  const texture = useTexture("/livewall-logo.svg");
  return (
    <mesh position={[0, 0, 0.072]} scale={[0.8, 0.8, 0.5]}>
      <planeGeometry args={[4.5, 1.0]} />
      <meshBasicMaterial map={texture} transparent alphaTest={0.05} />
    </mesh>
  );
}

function TVScreen({
  active,
  questionText,
}: {
  active: boolean;
  questionText?: string;
}) {
  const showLogo = !questionText;

  return (
    <group position={[-0.5, 3.3, -2.55]}>
      {/* Slim mounting plate */}
      <mesh position={[0, 0, -0.06]} receiveShadow>
        <boxGeometry args={[5.2, 2.5, 0.04]} />
        <meshStandardMaterial
          color="#0a0a12"
          roughness={0.75}
          metalness={0.2}
        />
      </mesh>

      {/* Logo — shown when no question is displayed */}
      {showLogo && (
        <Suspense fallback={null}>
          <TVScreenLogo />
        </Suspense>
      )}

      {/* Question text on screen */}
      {active && questionText && (
        <Text
          position={[0, 0, 0.072]}
          fontSize={0.17}
          color={LW_LIME}
          anchorX="center"
          anchorY="middle"
          maxWidth={4.0}
          lineHeight={1.3}
          font={undefined}
        >
          {questionText}
        </Text>
      )}
      {/* Glow when active */}
      {active && questionText && (
        <pointLight
          position={[0, -0.7, 0.3]}
          intensity={0.5}
          color={LW_LIME}
          distance={4.5}
        />
      )}
    </group>
  );
}

// ─── Player desk screen ──────────────────────────────────────────────────────

function PodiumScreenContent({ playerName }: { playerName: string }) {
  return (
    <>
      {/* Lime nameplate strip */}
      <mesh position={[0, 0.335, 0.892]}>
        <boxGeometry args={[0.93, 0.13, 0.004]} />
        <meshStandardMaterial
          color={LW_LIME}
          emissive={LW_LIME}
          emissiveIntensity={1.0}
        />
      </mesh>
      {/* "SPELER" label */}
      <Text
        position={[0, 0.335, 0.898]}
        fontSize={0.065}
        color="#000000"
        anchorX="center"
        anchorY="middle"
      >
        SPELER
      </Text>
      {/* Player name */}
      <Text
        position={[0, 0.575, 0.897]}
        fontSize={0.105}
        color={LW_LIME}
        anchorX="center"
        anchorY="middle"
        maxWidth={0.88}
      >
        {playerName}
      </Text>
    </>
  );
}

function PodiumScreen({
  playerName,
  active,
}: {
  playerName: string;
  active: boolean;
}) {
  return (
    <group>
      {/* Bezel */}
      <mesh position={[0, 0.52, 0.86]} castShadow>
        <boxGeometry args={[1.05, 0.52, 0.04]} />
        <meshStandardMaterial
          color="#050505"
          roughness={0.25}
          metalness={0.65}
        />
      </mesh>
      {/* Display surface */}
      <mesh position={[0, 0.52, 0.885]}>
        <boxGeometry args={[0.95, 0.43, 0.005]} />
        <meshStandardMaterial
          color="#02020f"
          emissive="#02020f"
          emissiveIntensity={active ? 0.6 : 0.08}
          roughness={0.05}
        />
      </mesh>
      {active && playerName && (
        <Suspense fallback={null}>
          <PodiumScreenContent playerName={playerName} />
        </Suspense>
      )}
      {/* Screen glow */}
      {active && playerName && (
        <pointLight
          position={[0, 0.3, 1.1]}
          intensity={0.5}
          color={LW_LIME}
          distance={1.5}
        />
      )}
    </group>
  );
}

// ─── Presenter greeting speech bubble ────────────────────────────────────────

function PresenterGreeting({
  text,
  visible,
}: {
  text: string;
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <Html position={[0.4, 2.25, 0.6]} center style={{ pointerEvents: "none" }}>
      <div
        style={{
          background: "rgba(5,5,10,0.92)",
          border: "1.5px solid #c8ff00",
          borderRadius: "4px",
          padding: "10px 16px",
          color: "white",
          fontSize: "15px",
          fontWeight: 600,
          whiteSpace: "nowrap",
          minWidth: "180px",
          textAlign: "center",
          backdropFilter: "blur(10px)",
          boxShadow: "0 0 20px rgba(200,255,0,0.2)",
          position: "relative",
        }}
      >
        <span
          style={{
            color: "#c8ff00",
            fontSize: "8px",
            letterSpacing: "3px",
            display: "block",
            marginBottom: "5px",
            opacity: 0.8,
          }}
        >
          PRESENTATOR
        </span>
        {text}
        <span style={{ color: "#c8ff00" }}>|</span>
        {/* Tail pointing down-left toward presenter */}
        <div
          style={{
            position: "absolute",
            bottom: "-10px",
            left: "20px",
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: "10px solid #c8ff00",
          }}
        />
      </div>
    </Html>
  );
}

// ─── Podium ──────────────────────────────────────────────────────────────────

function Podium({
  position,
  accentColor = LW_LIME,
  width = 1.6,
}: {
  position: [number, number, number];
  accentColor?: string;
  width?: number;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 1.0, 0.1]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 1.02, -0.22]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.06, 0.06, 0.56]} />
        <meshStandardMaterial
          color={LW_OFF_WHITE}
          roughness={0.3}
          metalness={0.08}
        />
      </mesh>
      <mesh position={[0, 1.01, 0.04]}>
        <boxGeometry args={[width + 0.06, 0.04, 0.04]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.7}
        />
      </mesh>
      <mesh position={[0, 0.02, 0.04]}>
        <boxGeometry args={[width + 0.06, 0.03, 0.04]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh position={[-width / 2 + 0.06, 0.5, -0.22]} castShadow>
        <boxGeometry args={[0.08, 1.0, 0.5]} />
        <meshStandardMaterial color="#080808" roughness={0.5} />
      </mesh>
      <mesh position={[width / 2 - 0.06, 0.5, -0.22]} castShadow>
        <boxGeometry args={[0.08, 1.0, 0.5]} />
        <meshStandardMaterial color="#080808" roughness={0.5} />
      </mesh>
    </group>
  );
}

// ─── Round stage ─────────────────────────────────────────────────────────────

// Platform top is at y = 0.30
const STAGE_TOP_Y = 0.3;
const STAGE_MAIN_Y = 0.1;

function RoundStage({ active }: { active: boolean }) {
  return (
    <group>
      {/* ── Outer base step (low ring) ── */}
      <mesh position={[0, 0.01, 0.5]} receiveShadow castShadow>
        <cylinderGeometry args={[3.85, 4.0, 0.2, 80]} />
        <meshStandardMaterial color="h" roughness={0.5} metalness={0.98} />
      </mesh>

      {/* ── Main raised platform ── */}
      <mesh position={[0, 0.1, 0.5]} receiveShadow castShadow>
        <cylinderGeometry args={[3.42, 3.42, 0.3, 98]} />
        <meshStandardMaterial color="white" roughness={0.1} metalness={0.7} />
      </mesh>

      {/* ── Top cap — polished surface ── */}

      <mesh position={[0, 0.305, 0.5]} receiveShadow>
        <cylinderGeometry args={[2.9, 1.4, 0, 80]} />
        <meshStandardMaterial color="white" roughness={0.06} metalness={0.8} />
      </mesh>

      <mesh
        position={[0, STAGE_TOP_Y + 0.006, 0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[2.75, 2.82, 80]} />
        <meshStandardMaterial
          color={LW_LIME}
          emissive={LW_LIME}
          emissiveIntensity={0.45}
          transparent
          opacity={0.1}
        />
      </mesh>

      {/* ── Glow lights — after start ── */}
      {active && (
        <>
          {/* Inner surface ring */}
          <mesh
            position={[0, STAGE_TOP_Y + 0.006, 0.5]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[2.75, 2.82, 80]} />
            <meshStandardMaterial
              color={LW_LIME}
              emissive={LW_LIME}
              emissiveIntensity={0.45}
              transparent
              opacity={1.0}
            />
          </mesh>

          <mesh
            position={[0, STAGE_MAIN_Y + 0.006, 0.5]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[5.75, 2.82, 80]} />
            <meshStandardMaterial
              color="white"
              emissive="red"
              emissiveIntensity={0.45}
              transparent
              opacity={0.5}
            />
          </mesh>

          {/* Under-stage bounce glow */}
          <pointLight
            position={[-0.5, 0.05, 0.5]}
            intensity={2.0}
            color={LW_LIME}
            distance={6}
          />
        </>
      )}
    </group>
  );
}

// ─── Floor ───────────────────────────────────────────────────────────────────

function StudioFloor() {
  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[30, 18]} />
        <meshStandardMaterial color="grey" roughness={0.18} metalness={0.55} />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.005, -0.5]}
        receiveShadow
      >
        <planeGeometry args={[14, 5]} />
        <meshStandardMaterial color="grey" roughness={0.22} metalness={0.5} />
      </mesh>
    </>
  );
}

// ─── Backdrop ────────────────────────────────────────────────────────────────

function Backdrop() {
  return (
    <>
      <mesh position={[0, 3.5, -2.8]} receiveShadow>
        <planeGeometry args={[22, 9]} />
        <meshStandardMaterial color="white" roughness={0.85} />
      </mesh>
      <mesh
        position={[-10, 3.5, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[4, 9]} />
        <meshStandardMaterial color="#060606" roughness={0.9} />
      </mesh>
      <mesh
        position={[10, 3.5, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[4, 9]} />
        <meshStandardMaterial color="#060606" roughness={0.9} />
      </mesh>
    </>
  );
}

// ─── Spotlight beams ─────────────────────────────────────────────────────────

const BEAM_HEIGHT = 9.5;
const BEAM_ORIGIN_Y = 9.0;

function SpotlightBeams({ active }: { active: boolean }) {
  const coreRefs = useRef<(THREE.Mesh | null)[]>([]);
  const haloRefs = useRef<(THREE.Mesh | null)[]>([]);

  const cones = useMemo(
    () => [
      { x: -5.0, targetX: -2.5, color: LW_LIME },
      { x: 1.8, targetX: 1.2, color: "#ffffff" },
      { x: -1.2, targetX: -0.4, color: LW_OFF_WHITE },
      { x: 4.5, targetX: 1.5, color: LW_LIME },
      { x: -6.5, targetX: -3.0, color: LW_OFF_WHITE },
    ],
    [],
  );

  useFrame((state) => {
    if (!active) return;
    const t = state.clock.elapsedTime;
    cones.forEach((cone, i) => {
      const dx = cone.targetX - cone.x;
      const baseAngle = Math.atan2(dx, BEAM_HEIGHT) * 0.8;
      const swing = Math.sin(t * 0.5 + i * 1.25) * 0.14;
      const finalAngle = -baseAngle + swing;
      if (coreRefs.current[i]) coreRefs.current[i]!.rotation.z = finalAngle;
      if (haloRefs.current[i]) haloRefs.current[i]!.rotation.z = finalAngle;
    });
  });

  return (
    <group>
      {cones.map((cone, i) => {
        const dx = cone.targetX - cone.x;
        const angle = Math.atan2(dx, BEAM_HEIGHT) * 0.8;
        const posX = cone.x + dx * 0.25;
        const posY = BEAM_ORIGIN_Y;

        return (
          <group key={i}>
            {/* Narrow core beam */}
            <mesh
              ref={(el) => {
                coreRefs.current[i] = el;
              }}
              position={[posX, posY, 0.8]}
              rotation={[0, 0, -angle]}
            >
              <coneGeometry args={[0.22, BEAM_HEIGHT, 8, 1, true]} />
              <meshStandardMaterial
                color={cone.color}
                emissive={cone.color}
                emissiveIntensity={active ? 0.28 : 0.04}
                transparent
                opacity={active ? 0.05 : 0.01}
                side={THREE.DoubleSide}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            {/* Wide soft halo — simulates blur */}
            <mesh
              ref={(el) => {
                haloRefs.current[i] = el;
              }}
              position={[posX, posY, 0.8]}
              rotation={[0, 0, -angle]}
            >
              <coneGeometry args={[1.1, BEAM_HEIGHT, 16, 1, true]} />
              <meshStandardMaterial
                color={cone.color}
                emissive={cone.color}
                emissiveIntensity={active ? 0.08 : 0.01}
                transparent
                opacity={active ? 0.018 : 0.004}
                side={THREE.DoubleSide}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ─── Lights ──────────────────────────────────────────────────────────────────

function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.55} color="#f0f2ff" />
      <directionalLight
        position={[0, 8, 5]}
        intensity={0.9}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <spotLight
        position={[2.5, 7.5, 4]}
        angle={0.28}
        penumbra={0.45}
        intensity={6.0}
        color="#fff8e8"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.001}
      />
      <spotLight
        position={[-4.5, 7, 4]}
        angle={0.3}
        penumbra={0.45}
        intensity={5.5}
        color="#f8ffe8"
        castShadow
      />
      <spotLight
        position={[-0.5, 5, 8]}
        angle={0.55}
        penumbra={1.0}
        intensity={3.0}
        color="#eef0ff"
      />
      <pointLight
        position={[-0.5, 1.8, 5]}
        intensity={1.2}
        color="#e0e8ff"
        distance={8}
      />
      <spotLight
        position={[4.5, 5.5, -1.5]}
        angle={0.3}
        penumbra={0.6}
        intensity={2.5}
        color={LW_LIME}
      />
      <spotLight
        position={[-6, 5.5, -1.5]}
        angle={0.3}
        penumbra={0.6}
        intensity={2.0}
        color={LW_LIME}
      />
      <spotLight
        position={[0, 3.5, 3]}
        angle={0.65}
        penumbra={1.0}
        intensity={2.0}
        color="#dde8ff"
      />
      <pointLight position={[0, 6.5, -2.5]} intensity={1.0} color={LW_LIME} />
      <pointLight position={[-7, 5, -2]} intensity={0.6} color={LW_OFF_WHITE} />
      <pointLight position={[7, 5, -2]} intensity={0.6} color={LW_OFF_WHITE} />
    </>
  );
}

// ─── Scene ───────────────────────────────────────────────────────────────────

function Scene({
  phase,
  playerName,
  greetingText,
  showGreeting,
  screenText,
  wheelBudgets,
  wheelSpinning,
  onWheelComplete,
}: {
  phase: GamePhase;
  playerName: string;
  greetingText: string;
  showGreeting: boolean;
  screenText: string;
  wheelBudgets: string[];
  wheelSpinning: boolean;
  onWheelComplete: (result: string) => void;
}) {
  const screenActive = phase !== "idle" && !!playerName;
  const isIdle = phase === "idle";
  const showWheel = phase === "wheelZoom" || wheelSpinning;

  return (
    <>
      <CameraRig phase={phase} />
      <StudioLights />
      <StudioFloor />
      <Backdrop />
      <RoundStage active={!isIdle} />
      <TVScreen active={screenActive} questionText={screenText || undefined} />
      <SpotlightBeams active={!isIdle} />
      <Audience />
      {showWheel && wheelBudgets.length > 0 && (
        <BudgetWheel
          budgets={wheelBudgets}
          spinning={wheelSpinning}
          onSpinComplete={onWheelComplete}
        />
      )}
      <fog attach="fog" args={["#000000", 12, 26]} />

      {/* Player — on round stage, rotated toward presenter */}
      <group position={[-1.8, STAGE_TOP_Y, 0]} rotation={[0, TURN_ANGLE, 0]}>
        <Podium position={[0, 0, 0.8]} accentColor={LW_LIME} width={1.4} />
        {!isIdle && <PixelCharacter type="player" position={[0, 0.05, 0]} />}
        <PodiumScreen playerName={playerName} active={screenActive} />
      </group>

      {/* Presenter — on round stage, rotated toward player */}
      <group position={[1.6, STAGE_TOP_Y, 0]} rotation={[0, -TURN_ANGLE, 0]}>
        <Podium position={[0, 0, 0.8]} accentColor={LW_OFF_WHITE} width={1.8} />
        {!isIdle && <PixelCharacter type="presenter" position={[0, 0.05, 0]} />}
        <PresenterGreeting text={greetingText} visible={showGreeting} />
      </group>
    </>
  );
}

// ─── Interview data ──────────────────────────────────────────────────────────

interface InterviewStep {
  key: string;
  label?: string;
  getPresenterText: (playerName: string) => string;
  placeholder?: string;
  inputType?: string;
  hasInput: boolean;
  isMultipleChoice?: boolean;
  isWheel?: boolean;
  isOutro?: boolean;
  showOnScreen?: boolean;
}

const INTERVIEW_STEPS: InterviewStep[] = [
  {
    key: "intro",
    getPresenterText: (name) =>
      `Welkom, ${name}! Fijn dat je er bent. Ik ga je drie vragen stellen.`,
    hasInput: false,
  },
  {
    key: "email",
    label: "VRAAG 1 / 3 — E-MAILADRES",
    getPresenterText: () => "Wat is je e-mailadres?",
    placeholder: "naam@bedrijf.nl",
    inputType: "email",
    hasInput: true,
    showOnScreen: true,
  },
  {
    key: "company",
    label: "VRAAG 2 / 3 — BEDRIJFSNAAM",
    getPresenterText: () => "Wat is de naam van je bedrijf?",
    placeholder: "Bijv. Livewall BV",
    inputType: "text",
    hasInput: true,
    showOnScreen: true,
  },
  {
    key: "projectType",
    label: "VRAAG 3 / 3 — TYPE PROJECT",
    getPresenterText: () => "Wat voor type project zoek je?",
    hasInput: true,
    isMultipleChoice: true,
    showOnScreen: true,
  },
  {
    key: "budget",
    getPresenterText: () =>
      "Top keuze! Laten we jouw budget bepalen... Ik draai aan het rad!",
    hasInput: false,
    isWheel: true,
  },
  {
    key: "outro",
    getPresenterText: (name) =>
      `Fantastisch, ${name}! Bedankt voor je antwoorden. We nemen snel contact met je op!`,
    hasInput: false,
    isOutro: true,
  },
];

const QUESTION_COUNT = 3;

const PROJECT_TYPES = [
  "Website",
  "App",
  "Campagne",
  "Branding",
  "E-commerce",
  "Anders",
];

const BUDGET_BY_PROJECT: Record<string, string[]> = {
  Website: [
    "€3k–€8k",
    "€8k–€15k",
    "€15k–€30k",
    "€30k–€50k",
    "€50k–€75k",
    "€75k+",
  ],
  App: [
    "€10k–€25k",
    "€25k–€50k",
    "€50k–€75k",
    "€75k–€100k",
    "€100k–€150k",
    "€150k+",
  ],
  Campagne: [
    "€2k–€5k",
    "€5k–€12k",
    "€12k–€25k",
    "€25k–€50k",
    "€50k–€75k",
    "€75k+",
  ],
  Branding: [
    "€2k–€5k",
    "€5k–€10k",
    "€10k–€20k",
    "€20k–€35k",
    "€35k–€50k",
    "€50k+",
  ],
  "E-commerce": [
    "€5k–€15k",
    "€15k–€30k",
    "€30k–€60k",
    "€60k–€100k",
    "€100k–€150k",
    "€150k+",
  ],
  Anders: [
    "€2k–€10k",
    "€10k–€25k",
    "€25k–€50k",
    "€50k–€100k",
    "€100k–€150k",
    "€150k+",
  ],
};
const DEFAULT_BUDGETS = [
  "€3k–€10k",
  "€10k–€25k",
  "€25k–€50k",
  "€50k–€100k",
  "€100k–€150k",
  "€150k+",
];

// ─── Budget wheel ────────────────────────────────────────────────────────────

const WHEEL_COLORS = [
  "#c8ff00",
  "#111111",
  "#f5f5e8",
  "#0d0d0d",
  "#a8d800",
  "#1e1e1e",
];
const WHEEL_TEXT_COLORS = [
  "#000000",
  "#c8ff00",
  "#000000",
  "#c8ff00",
  "#000000",
  "#c8ff00",
];

function BudgetWheel({
  budgets,
  spinning,
  onSpinComplete,
}: {
  budgets: string[];
  spinning: boolean;
  onSpinComplete: (result: string) => void;
}) {
  const wheelRef = useRef<THREE.Group>(null);
  const spinRef = useRef<{
    active: boolean;
    startTime: number;
    finalAngle: number;
    duration: number;
    targetIdx: number;
    done: boolean;
  }>({
    active: false,
    startTime: -1,
    finalAngle: 0,
    duration: 4.5,
    targetIdx: 0,
    done: true,
  });

  const segCount = budgets.length;
  const segAngle = (Math.PI * 2) / segCount;

  useEffect(() => {
    if (!spinning) return;
    const targetIdx = Math.floor(Math.random() * segCount);
    // Compute final angle so targetIdx lands at 12 o'clock (π/2)
    let stop = Math.PI / 2 - targetIdx * segAngle - segAngle / 2;
    while (stop < 0) stop += Math.PI * 2;
    const finalAngle = Math.PI * 2 * 6 + stop; // 6 full rotations
    spinRef.current = {
      active: true,
      startTime: -1,
      finalAngle,
      duration: 4.0 + Math.random() * 0.8,
      targetIdx,
      done: false,
    };
  }, [spinning, segCount, segAngle]);

  useFrame((state) => {
    const s = spinRef.current;
    if (!s.active || !wheelRef.current) return;
    if (s.startTime < 0) s.startTime = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - s.startTime;
    const progress = Math.min(elapsed / s.duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    wheelRef.current.rotation.z = s.finalAngle * eased;
    if (progress >= 1 && !s.done) {
      s.done = true;
      s.active = false;
      onSpinComplete(budgets[s.targetIdx]);
    }
  });

  return (
    // Positioned to the right of the presenter on stage
    <group position={[2.8, STAGE_TOP_Y, 0.2]}>
      {/* Vertical pole */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.07, 1.6, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Base disc */}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[0.3, 0.35, 0.08, 32]} />
        <meshStandardMaterial color="#111111" roughness={0.2} metalness={0.6} />
      </mesh>

      {/* ── Spinning wheel group ── */}
      <group ref={wheelRef} position={[0, 1.6, 0]}>
        {budgets.map((budget, i) => {
          const start = i * segAngle;
          const mid = start + segAngle / 2;
          const textR = 0.72;
          return (
            <group key={i}>
              {/* Segment */}
              <mesh rotation={[0, 0, 0]}>
                <circleGeometry args={[1.18, 64, start, segAngle - 0.015]} />
                <meshStandardMaterial
                  color={WHEEL_COLORS[i % WHEEL_COLORS.length]}
                  side={THREE.DoubleSide}
                  roughness={0.5}
                />
              </mesh>
              {/* Budget label */}
              <Text
                position={[Math.cos(mid) * textR, Math.sin(mid) * textR, 0.015]}
                rotation={[0, 0, mid - Math.PI / 2]}
                fontSize={0.115}
                color={WHEEL_TEXT_COLORS[i % WHEEL_TEXT_COLORS.length]}
                anchorX="center"
                anchorY="middle"
                maxWidth={0.7}
              >
                {budget}
              </Text>
            </group>
          );
        })}
        {/* Divider lines between segments */}
        {budgets.map((_, i) => {
          const angle = i * segAngle;
          return (
            <mesh key={`div-${i}`} rotation={[0, 0, angle]}>
              <planeGeometry args={[0.012, 1.2]} />
              <meshStandardMaterial color="#000000" side={THREE.DoubleSide} />
            </mesh>
          );
        })}
        {/* Center hub */}
        <mesh position={[0, 0, 0.02]}>
          <circleGeometry args={[0.12, 32]} />
          <meshStandardMaterial
            color={LW_LIME}
            emissive={LW_LIME}
            emissiveIntensity={0.9}
          />
        </mesh>
      </group>

      {/* ── Fixed outer ring (doesn't spin) ── */}
      <mesh position={[0, 1.6, 0]}>
        <torusGeometry args={[1.2, 0.045, 8, 80]} />
        <meshStandardMaterial
          color={LW_LIME}
          emissive={LW_LIME}
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Pointer arrow at 12 o'clock */}
      <mesh position={[0, 2.87, 0.04]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.09, 0.22, 3]} />
        <meshStandardMaterial
          color={LW_LIME}
          emissive={LW_LIME}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Glow light */}
      <pointLight
        position={[0, 1.6, 0.5]}
        intensity={1.2}
        color={LW_LIME}
        distance={3}
      />
    </group>
  );
}

// ─── Main experience ─────────────────────────────────────────────────────────

export default function GameshowExperience() {
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [playerName, setPlayerName] = useState("");
  const [nameInput, setNameInput] = useState("");

  // ── Interview state ──
  const [interviewStep, setInterviewStep] = useState(-1);
  const [presenterFullText, setPresenterFullText] = useState("");
  const [presenterTypedText, setPresenterTypedText] = useState("");
  const [typingDone, setTypingDone] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [screenText, setScreenText] = useState("");

  // ── Wheel state ──
  const [wheelBudgets, setWheelBudgets] = useState<string[]>([]);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState("");

  const nameInputRef = useRef<HTMLInputElement>(null);
  const answerInputRef = useRef<HTMLInputElement>(null);

  // ── Typewriter ──
  useEffect(() => {
    if (!presenterFullText) return;
    let i = 0;
    setPresenterTypedText("");
    setTypingDone(false);
    setShowInput(false);
    const interval = setInterval(() => {
      if (i <= presenterFullText.length) {
        setPresenterTypedText(presenterFullText.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setTypingDone(true);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [presenterFullText]);

  // ── After typing done ──
  useEffect(() => {
    if (!typingDone || interviewStep < 0) return;
    const step = INTERVIEW_STEPS[interviewStep];
    if (!step) return;

    if (step.isOutro) {
      const t = setTimeout(() => setIsComplete(true), 2800);
      return () => clearTimeout(t);
    }

    // Wheel step: camera zooms to wheel, spin starts
    if (step.isWheel) {
      const projectType = answers.projectType ?? "";
      const budgets = BUDGET_BY_PROJECT[projectType] ?? DEFAULT_BUDGETS;
      setWheelBudgets(budgets);
      const t = setTimeout(() => {
        setPhase("wheelZoom");
        setTimeout(() => setWheelSpinning(true), 1800);
      }, 600);
      return () => clearTimeout(t);
    }

    if (step.showOnScreen) {
      setScreenText(step.getPresenterText(playerName));
    }

    if (!step.hasInput) {
      const nextIdx = interviewStep + 1;
      const nextStep = INTERVIEW_STEPS[nextIdx];
      if (!nextStep) return;
      const t = setTimeout(() => {
        setInterviewStep(nextIdx);
        setPresenterFullText(nextStep.getPresenterText(playerName));
      }, 1800);
      return () => clearTimeout(t);
    }

    setShowInput(true);
    setTimeout(() => answerInputRef.current?.focus(), 60);
  }, [typingDone, interviewStep, playerName, answers]);

  // ── Wheel spin complete ──
  const handleWheelComplete = useCallback(
    (result: string) => {
      setWheelSpinning(false);
      setWheelResult(result);
      setAnswers((prev) => ({ ...prev, budget: result }));
      setScreenText(`BUDGET: ${result}`);
      // After showing result, advance to outro
      const outroIdx = INTERVIEW_STEPS.findIndex((s) => s.isOutro);
      setTimeout(() => {
        setPhase("questionPlayer");
        setScreenText("");
        setInterviewStep(outroIdx);
        setPresenterFullText(
          INTERVIEW_STEPS[outroIdx].getPresenterText(playerName),
        );
      }, 3000);
    },
    [playerName],
  );

  // ── Submit text answer ──
  const submitAnswer = useCallback(
    (val: string) => {
      if (!val) return;
      const step = INTERVIEW_STEPS[interviewStep];
      if (!step) return;
      setAnswers((prev) => ({ ...prev, [step.key]: val }));
      setCurrentInput("");
      setShowInput(false);
      setScreenText("");
      const nextIdx = interviewStep + 1;
      const nextStep = INTERVIEW_STEPS[nextIdx];
      if (!nextStep) return;
      setInterviewStep(nextIdx);
      setPresenterFullText(nextStep.getPresenterText(playerName));
    },
    [interviewStep, playerName],
  );

  const handleAnswerSubmit = useCallback(
    () => submitAnswer(currentInput.trim()),
    [currentInput, submitAnswer],
  );

  // ── Start ──
  const handleStart = useCallback(() => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setPlayerName(trimmed);
    setPhase("toPlayer");
    setTimeout(() => setPhase("toPresenter"), 2000);
    setTimeout(() => setPhase("zoomIn"), 4200);
    setTimeout(() => {
      setPhase("questionPlayer");
      setInterviewStep(0);
      setPresenterFullText(INTERVIEW_STEPS[0].getPresenterText(trimmed));
    }, 5800);
  }, [nameInput]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleStart();
    },
    [handleStart],
  );
  const handleAnswerKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleAnswerSubmit();
    },
    [handleAnswerSubmit],
  );

  const currentStep = INTERVIEW_STEPS[interviewStep];
  const questionNumber =
    interviewStep >= 1 && interviewStep <= QUESTION_COUNT ? interviewStep : 0;
  const isQuestionPhase = phase === "questionPlayer" || phase === "wheelZoom";
  const showPresenter = isQuestionPhase && interviewStep >= 0 && !isComplete;
  // Name chip: only during camera travel (not question or idle)
  const showNameChip =
    phase !== "idle" &&
    phase !== "questionPlayer" &&
    phase !== "wheelZoom" &&
    playerName;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <Canvas
        shadows
        camera={{ fov: 46, near: 0.1, far: 100, position: [-0.5, 3.8, 10] }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.45,
        }}
      >
        <Scene
          phase={phase}
          playerName={playerName}
          greetingText={presenterTypedText}
          showGreeting={showPresenter}
          screenText={screenText}
          wheelBudgets={wheelBudgets}
          wheelSpinning={wheelSpinning}
          onWheelComplete={handleWheelComplete}
        />
      </Canvas>

      {/* ── 2D overlay ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/65 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/65 to-transparent" />

        {/* Logo */}
        <div className="absolute left-1/2 top-5 -translate-x-1/2 text-center">
          <h1 className="font-pixel text-[10px] tracking-[0.35em] text-white/80 sm:text-[11px]">
            LIVEWALL
          </h1>
          <div className="mx-auto mt-1 h-[2px] w-16 bg-[#c8ff00]/70" />
          <p className="font-pixel mt-1 text-[7px] tracking-[0.2em] text-[#c8ff00]/60">
            GAMESHOW
          </p>
        </div>

        {/* ── START screen ── */}
        {phase === "idle" && (
          <div className="pointer-events-auto absolute inset-0 flex flex-col items-center justify-center gap-8">
            <div className="pointer-events-none absolute inset-0 bg-black/55 backdrop-blur-[2px]" />
            <div className="relative z-10 text-center">
              <p className="font-pixel mb-4 text-[9px] tracking-[0.3em] text-[#c8ff00]">
                EPISODE 01
              </p>
              <h2 className="font-pixel text-2xl text-white sm:text-3xl">
                READY?
              </h2>
              <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-white/60">
                Welkom bij de Livewall Gameshow. Voer je naam in en ga van
                start.
              </p>
            </div>
            <div className="relative z-10 w-full max-w-sm space-y-3 px-6">
              <label className="font-pixel block text-[8px] tracking-[0.25em] text-[#c8ff00]/70">
                JOUW NAAM
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Typ hier je naam..."
                autoFocus
                className="w-full border border-white/20 bg-white/6 px-4 py-3 text-base text-white placeholder-white/25 outline-none transition-all focus:border-[#c8ff00]/80 focus:bg-white/10"
              />
              <button
                onClick={handleStart}
                disabled={!nameInput.trim()}
                className="animate-pulse-glow font-pixel w-full border-2 border-[#c8ff00] bg-[#c8ff00] py-4 text-sm text-black transition-all hover:scale-[1.02] hover:bg-transparent hover:text-[#c8ff00] active:scale-95 disabled:cursor-not-allowed disabled:opacity-25 disabled:shadow-none"
              >
                START →
              </button>
            </div>
          </div>
        )}

        {/* ── Camera travel name chip ── */}
        {showNameChip && (
          <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="animate-fade-in-up flex items-center gap-2 border border-white/10 bg-black/70 px-5 py-2 backdrop-blur-md">
              <div className="h-1.5 w-1.5 rounded-full bg-[#c8ff00]" />
              <span className="font-pixel text-[8px] tracking-wider text-[#c8ff00]">
                {playerName.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* ── Q&A text input panel ── */}
        {phase === "questionPlayer" &&
          showInput &&
          !isComplete &&
          currentStep &&
          !currentStep.isMultipleChoice && (
            <div className="pointer-events-auto absolute inset-x-0 bottom-0 flex justify-center p-4 pb-7">
              <div className="w-full max-w-lg space-y-3 border border-white/10 bg-black/85 p-5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-[8px] tracking-[0.2em] text-[#c8ff00]/80">
                    {currentStep.label}
                  </span>
                  <div className="flex gap-2">
                    {Array.from({ length: QUESTION_COUNT }, (_, n) => (
                      <div
                        key={n}
                        className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                          n + 1 < questionNumber
                            ? "bg-[#c8ff00]"
                            : n + 1 === questionNumber
                              ? "bg-[#c8ff00]/70 ring-1 ring-[#c8ff00]/50"
                              : "bg-white/20"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <input
                  ref={answerInputRef}
                  type={currentStep.inputType ?? "text"}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleAnswerKeyDown}
                  placeholder={currentStep.placeholder}
                  className="w-full border border-white/20 bg-white/6 px-4 py-3 text-base text-white placeholder-white/25 outline-none transition-all focus:border-[#c8ff00]/70 focus:bg-white/10"
                />
                <button
                  onClick={handleAnswerSubmit}
                  disabled={!currentInput.trim()}
                  className="font-pixel w-full border border-[#c8ff00]/40 bg-[#c8ff00]/10 py-3 text-[11px] tracking-[0.2em] text-[#c8ff00] transition-all hover:bg-[#c8ff00] hover:text-black disabled:cursor-not-allowed disabled:opacity-25"
                >
                  VOLGENDE →
                </button>
              </div>
            </div>
          )}

        {/* ── Multiple choice: project type ── */}
        {phase === "questionPlayer" &&
          showInput &&
          !isComplete &&
          currentStep?.isMultipleChoice && (
            <div className="pointer-events-auto absolute inset-x-0 bottom-0 flex justify-center p-4 pb-7">
              <div className="w-full max-w-lg space-y-4 border border-white/10 bg-black/85 p-5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-[8px] tracking-[0.2em] text-[#c8ff00]/80">
                    {currentStep.label}
                  </span>
                  <div className="flex gap-2">
                    {Array.from({ length: QUESTION_COUNT }, (_, n) => (
                      <div
                        key={n}
                        className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                          n + 1 < questionNumber
                            ? "bg-[#c8ff00]"
                            : n + 1 === questionNumber
                              ? "bg-[#c8ff00]/70 ring-1 ring-[#c8ff00]/50"
                              : "bg-white/20"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {PROJECT_TYPES.map((pt) => (
                    <button
                      key={pt}
                      onClick={() => submitAnswer(pt)}
                      className="font-pixel border border-white/20 bg-white/5 py-3 text-[10px] tracking-[0.15em] text-white/80 transition-all hover:border-[#c8ff00] hover:bg-[#c8ff00]/15 hover:text-[#c8ff00] active:scale-95"
                    >
                      {pt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        {/* ── Wheel spinning banner ── */}
        {phase === "wheelZoom" && wheelSpinning && !wheelResult && (
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <p className="font-pixel animate-pulse text-[11px] tracking-[0.3em] text-[#c8ff00]/80">
              HET RAD DRAAIT...
            </p>
          </div>
        )}

        {/* ── Wheel result banner ── */}
        {wheelResult && phase === "wheelZoom" && (
          <div className="pointer-events-none absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="font-pixel mb-2 text-[9px] tracking-[0.3em] text-[#c8ff00]/70">
              BUDGET
            </p>
            <p className="font-pixel text-4xl text-white drop-shadow-lg">
              {wheelResult}
            </p>
          </div>
        )}

        {/* ── Complete screen ── */}
        {isComplete && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-7 bg-black/75 backdrop-blur-sm">
            <div className="text-center">
              <p className="font-pixel mb-3 text-[9px] tracking-[0.35em] text-[#c8ff00]">
                VOLTOOID
              </p>
              <h2 className="font-pixel text-3xl text-white">
                Bedankt, {playerName}!
              </h2>
              <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-white/55">
                Je antwoorden zijn ontvangen. We nemen snel contact met je op.
              </p>
            </div>
            <div className="w-full max-w-sm border border-white/10 px-6 py-4">
              {(
                [
                  { key: "email", label: "E-mail" },
                  { key: "company", label: "Bedrijf" },
                  { key: "projectType", label: "Project" },
                  { key: "budget", label: "Budget" },
                ] as { key: string; label: string }[]
              ).map(({ key, label }) =>
                answers[key] ? (
                  <div
                    key={key}
                    className="flex items-baseline justify-between border-b border-white/10 py-2.5 last:border-0"
                  >
                    <span className="font-pixel text-[8px] tracking-widest text-[#c8ff00]/60">
                      {label.toUpperCase()}
                    </span>
                    <span className="text-sm text-white/75">
                      {answers[key]}
                    </span>
                  </div>
                ) : null,
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
