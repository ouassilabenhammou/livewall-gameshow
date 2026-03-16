"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import Image from "next/image";
import { Text, Html, useTexture } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Suspense, useState, useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import CameraRig, { type GamePhase } from "./CameraRig";
import PixelCharacter from "./PixelCharacter";
import Audience from "./Audience";

// Kleuren
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
  budgetText,
}: {
  active: boolean;
  budgetText?: string;
}) {
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

      {/* Logo — always shown unless budget result overrides */}
      {!budgetText && (
        <Suspense fallback={null}>
          <TVScreenLogo />
        </Suspense>
      )}

      {/* Budget result — only shown after wheel spin */}
      {active && budgetText && (
        <>
          <Text
            position={[0, 0.35, 0.072]}
            fontSize={0.11}
            color={LW_LIME}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.2}
          >
            BUDGET
          </Text>
          <Text
            position={[0, -0.1, 0.072]}
            fontSize={0.32}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {budgetText}
          </Text>
          <pointLight
            position={[0, -0.2, 0.3]}
            intensity={0.6}
            color={LW_LIME}
            distance={4.5}
          />
        </>
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

// ─── Presenter desk screen ───────────────────────────────────────────────────

function PresenterScreenContent() {
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
      {/* "PRESENTATOR" label on strip */}
      <Text
        position={[0, 0.335, 0.898]}
        fontSize={0.055}
        color="#000000"
        anchorX="center"
        anchorY="middle"
      >
        PRESENTATOR
      </Text>
    </>
  );
}

function PresenterPodiumScreen({ active }: { active: boolean }) {
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
      {active && (
        <Suspense fallback={null}>
          <PresenterScreenContent />
        </Suspense>
      )}
      {active && (
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
    <Html position={[0.3, 2.6, 1.5]} center style={{ pointerEvents: "none" }}>
      <div
        style={{
          background: "rgba(4,4,10,0.94)",
          border: "1px solid #c8ff00",
          borderRadius: "3px",
          padding: "7px 12px",
          color: "white",
          fontSize: "12px",
          fontWeight: 600,
          width: "200px",
          textAlign: "center",
          backdropFilter: "blur(8px)",
          boxShadow: "0 0 16px rgba(200,255,0,0.18)",
          position: "relative",
          lineHeight: 1.45,
        }}
      >
        <span
          style={{
            color: "#c8ff00",
            fontSize: "7px",
            letterSpacing: "2.5px",
            display: "block",
            marginBottom: "4px",
            opacity: 0.75,
          }}
        >
          PRESENTATOR
        </span>
        {text}
        <div
          style={{
            position: "absolute",
            bottom: "-8px",
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "8px solid #c8ff00",
          }}
        />
      </div>
    </Html>
  );
}

// ─── Player reply speech bubble ───────────────────────────────────────────────

function PlayerReplyBubble({
  text,
  visible,
}: {
  text: string;
  visible: boolean;
}) {
  if (!visible || !text) return null;
  return (
    <Html position={[0, 2.5, 0.5]} center style={{ pointerEvents: "none" }}>
      <div
        style={{
          background: "rgba(4,4,10,0.94)",
          border: "1px solid #c8ff00",
          borderRadius: "3px",
          padding: "7px 12px",
          color: "white",
          fontSize: "12px",
          fontWeight: 600,
          maxWidth: "180px",
          textAlign: "center",
          backdropFilter: "blur(8px)",
          boxShadow: "0 0 16px rgba(200,255,0,0.18)",
          position: "relative",
          lineHeight: 1.45,
        }}
      >
        <span
          style={{
            color: "#c8ff00",
            fontSize: "7px",
            letterSpacing: "2.5px",
            display: "block",
            marginBottom: "4px",
            opacity: 0.75,
          }}
        >
          SPELER
        </span>
        {text}
        <div
          style={{
            position: "absolute",
            bottom: "-8px",
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "8px solid #c8ff00",
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

type Speaker = "player" | "presenter" | null;

// ─── Zachte mistige spotlight op de actieve spreker ──────────────────────────

function SpeakerSpotlight({ speaker }: { speaker: Speaker }) {
  const isActive = speaker === "player" || speaker === "presenter";
  const x = speaker === "player" ? -1.8 : 1.6;

  // Lichtbron hoog boven de spreker
  const lightPos: [number, number, number] = [x, 9.2, 1.8];
  // Conus-middelpunt: halverwege tussen lichtbron (y=9.2) en vloer (y=0.3)
  const coneCenter: [number, number, number] = [x, 4.75, 0.9];
  const coneHeight = 8.9;
  // Zachte vloerpoel direct op het podium

  if (!isActive) return null;

  return (
    <>
      {/* De eigenlijke lichtbron — hoge penumbra voor vage overgang */}
      <spotLight
        position={lightPos}
        angle={0.32}
        penumbra={0.98}
        intensity={5.5}
        color="#fff8f0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        distance={28}
        decay={1.3}
      />

      {/* Kern van de lichtstraal — smal, licht zichtbaar */}
      <mesh position={coneCenter}>
        <coneGeometry args={[0.55, coneHeight, 32, 1, true]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.028}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Eerste mistige halo — iets breder, bijna onzichtbaar */}
      <mesh position={coneCenter}>
        <coneGeometry args={[1.1, coneHeight, 32, 1, true]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.2}
          transparent
          opacity={0.04}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  );
}

// ─── Lights ──────────────────────────────────────────────────────────────────

function StudioLights({
  speaker,
  active,
}: {
  speaker: Speaker;
  active: boolean;
}) {
  return (
    <>
      {/* Soft overall base light */}
      <ambientLight intensity={0.45} color="#f0f2ff" />
      <directionalLight position={[0, 8, 5]} intensity={0.7} color="#ffffff" />

      {/* Enkele grote spotlight vanaf het plafond op de actieve spreker */}
      <SpeakerSpotlight speaker={speaker} />
    </>
  );
}

// ─── Scene ───────────────────────────────────────────────────────────────────

function Scene({
  phase,
  playerName,
  greetingText,
  showGreeting,
  playerReplyText,
  showPlayerReply,
  screenText,
  wheelBudgets,
  wheelTargetBudget,
  wheelSpinning,
  onWheelComplete,
  speaker,
}: {
  phase: GamePhase;
  playerName: string;
  greetingText: string;
  showGreeting: boolean;
  playerReplyText: string;
  showPlayerReply: boolean;
  screenText: string;
  wheelBudgets: string[];
  wheelTargetBudget: string;
  wheelSpinning: boolean;
  onWheelComplete: (result: string) => void;
  speaker: Speaker;
}) {
  const screenActive = phase !== "idle" && !!playerName;
  const isIdle = phase === "idle";
  const showWheel = phase === "wheelZoom" || wheelSpinning;
  const lightsActive = !isIdle;

  return (
    <>
      <CameraRig phase={phase} />
      <StudioLights speaker={speaker} active={lightsActive} />
      <StudioFloor />
      <Backdrop />
      <RoundStage active={!isIdle} />
      <TVScreen active={screenActive} budgetText={screenText || undefined} />
      <Audience />
      {showWheel && wheelBudgets.length > 0 && wheelTargetBudget && (
        <BudgetWheel
          budgets={wheelBudgets}
          targetBudget={wheelTargetBudget}
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
        <PlayerReplyBubble text={playerReplyText} visible={showPlayerReply} />
      </group>

      {/* Presenter — on round stage, rotated toward player */}
      <group position={[1.6, STAGE_TOP_Y, 0]} rotation={[0, -TURN_ANGLE, 0]}>
        <Podium position={[0, 0, 0.8]} accentColor={LW_OFF_WHITE} width={1.8} />
        {!isIdle && <PixelCharacter type="presenter" position={[0, 0.05, 0]} />}
        <PresenterPodiumScreen active={screenActive} />
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
    label: "E-MAILADRES",
    getPresenterText: () => "Wat is je e-mailadres?",
    placeholder: "naam@bedrijf.nl",
    inputType: "email",
    hasInput: true,
    showOnScreen: true,
  },
  {
    key: "company",
    label: "BEDRIJFSNAAM",
    getPresenterText: () => "Wat is de naam van je bedrijf?",
    placeholder: "Bijv. Livewall BV",
    inputType: "text",
    hasInput: true,
    showOnScreen: true,
  },
  {
    key: "projectType",
    label: "TYPE PROJECT",
    getPresenterText: () => "Wat voor type project zoek je?",
    hasInput: true,
    isMultipleChoice: true,
    showOnScreen: true,
  },
  {
    key: "budget",
    getPresenterText: () =>
      "Top keuze! Laten we jouw budget bepalen. Draai aan het rad!",
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
    "€5k–€10k",
  ],
  App: [
    "€10k–€20k",
  ],
  Campagne: [
    "€20k–€30k",
  ],
  Branding: [
    "€30k–€40k",
  ],
  "E-commerce": [
    "€40k–€50k",
  ],
  Anders: [
    "€50k+",
  ],
};
const DEFAULT_BUDGETS = [
  "€5k–€10k",
  "€10k–€20k",
  "€20k–€30k",
  "€30k–€40k",
  "€40k–€50k",
  "€50k+",
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
  targetBudget,
  spinning,
  onSpinComplete,
}: {
  budgets: string[];
  /** Budget to land on (must be one of budgets); wheel shows all but stops here */
  targetBudget: string;
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
    const targetIdx = (() => {
      const idx = budgets.indexOf(targetBudget);
      return idx >= 0 ? idx : Math.floor(Math.random() * segCount);
    })();
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
  }, [spinning, segCount, segAngle, budgets, targetBudget]);

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
    // Positioned to the other side of the studio on stage
    <group position={[-3.8, STAGE_TOP_Y, 1.2]}>
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
      <mesh position={[0, 2.85, 0.06]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.09, 0.22, 3]} />
        <meshStandardMaterial
          color="black"
          emissive="black"
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
  const [playerReplyText, setPlayerReplyText] = useState("");
  const [showPlayerReply, setShowPlayerReply] = useState(false);

  // ── Wheel state ──
  const [wheelBudgets, setWheelBudgets] = useState<string[]>([]);
  const [wheelTargetBudget, setWheelTargetBudget] = useState("");
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState("");
  const [wheelCanSpin, setWheelCanSpin] = useState(false);

  // ── Error state ──
  const [nameError, setNameError] = useState("");
  const [inputError, setInputError] = useState("");
  const [wheelError, setWheelError] = useState("");
  const [editError, setEditError] = useState("");

  // ── Homepage / send state ──
  const [showHomepage, setShowHomepage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const nameInputRef = useRef<HTMLInputElement>(null);
  const answerInputRef = useRef<HTMLInputElement>(null);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Typewriter (faster + skip on click) ──
  const skipTyping = useCallback(() => {
    if (typingIntervalRef.current && presenterFullText) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
      setPresenterTypedText(presenterFullText);
      setTypingDone(true);
    }
  }, [presenterFullText]);

  useEffect(() => {
    if (!presenterFullText) return;
    let i = 0;
    setPresenterTypedText("");
    setTypingDone(false);
    setShowInput(false);
    typingIntervalRef.current = setInterval(() => {
      if (i <= presenterFullText.length) {
        setPresenterTypedText(presenterFullText.slice(0, i));
        i++;
      } else {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        setTypingDone(true);
      }
    }, 50);
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    };
  }, [presenterFullText]);

  // ── After typing done ──
  useEffect(() => {
    if (!typingDone) return;

    // TV-budget: presentator heeft "dan mikken we op X..." uitgetypt → leespauze, dan naar outro (zoals andere rondes)
    if (phase === "tvBudget" && answers.budget) {
      const outroIdx = INTERVIEW_STEPS.findIndex((s) => s.isOutro);
      const t = setTimeout(() => {
        setPhase("questionPlayer");
        setScreenText("");
        setInterviewStep(outroIdx);
        setPresenterFullText(
          INTERVIEW_STEPS[outroIdx].getPresenterText(playerName),
        );
      }, 1100);
      return () => clearTimeout(t);
    }

    if (interviewStep < 0) return;
    const step = INTERVIEW_STEPS[interviewStep];
    if (!step) return;

    if (step.isOutro) {
      // Korte leespauze na outro-tekst, dan naar eindscherm
      const t = setTimeout(() => setIsComplete(true), 1400);
      return () => clearTimeout(t);
    }

    // Wheel step: camera zooms to wheel, spin starts (only when not yet completed)
    if (step.isWheel) {
      if (answers.budget) return; // Already spun; handleWheelComplete owns phase flow
      const projectType = answers.projectType ?? "";
      const projectBudgets = BUDGET_BY_PROJECT[projectType] ?? DEFAULT_BUDGETS;
      const targetBudget = projectBudgets[0] ?? DEFAULT_BUDGETS[0];
      setWheelBudgets(DEFAULT_BUDGETS);
      setWheelTargetBudget(targetBudget);
      setWheelResult("");
      setWheelSpinning(false);
      // Al in wheelZoom? Niet opnieuw resetten anders flasht de knop (effect draait op phase-change).
      if (phase === "wheelZoom") {
        if (!wheelResult && !wheelSpinning) setWheelCanSpin(true);
        return;
      }
      setWheelCanSpin(false);
      // Korte leespauze na "Draai aan het rad", dan rad tonen
      const t = setTimeout(() => {
        setPhase("wheelZoom");
        setWheelCanSpin(true);
      }, 800);
      return () => clearTimeout(t);
    }

    if (!step.hasInput) {
      const nextIdx = interviewStep + 1;
      const nextStep = INTERVIEW_STEPS[nextIdx];
      if (!nextStep) return;
      // Korte leespauze na presentatortekst, dan volgende zin
      const t = setTimeout(() => {
        setInterviewStep(nextIdx);
        setPresenterFullText(nextStep.getPresenterText(playerName));
      }, 1100);
      return () => clearTimeout(t);
    }

    // Invoer/keuzes alleen tonen als de speler nog níet heeft geantwoord op deze vraag
    // (na submit verandert answers en zou dit effect anders opnieuw het invoer tonen)
    if (answers[step.key] !== undefined && answers[step.key] !== "") return;

    // Korte leespauze na vraag van presentator, dan invoerveld tonen
    const t = setTimeout(() => {
      setShowInput(true);
      setTimeout(() => answerInputRef.current?.focus(), 60);
    }, 700);
    return () => clearTimeout(t);
  }, [typingDone, interviewStep, playerName, answers, phase]);

  // ── Wheel spin complete ──
  const handleWheelComplete = useCallback(
    (result: string) => {
      setWheelSpinning(false);
      setWheelCanSpin(false);
      setWheelResult(result);
      setAnswers((prev) => ({ ...prev, budget: result }));
      setScreenText(result);
      // Camera naar TV; presentator zegt "dan mikken we op X...". Overgang naar outro gebeurt in effect na typing + leespauze.
      setTimeout(() => {
        setPhase("tvBudget");
        setPresenterFullText(
          `${playerName}, dan mikken we op ${result}. Daar kunnen we iets heel tofs mee bouwen!`,
        );
      }, 400);
    },
    [playerName],
  );

  // ── Submit text answer ──
  const submitAnswer = useCallback(
    (val: string) => {
      const trimmed = val.trim();
      const step = INTERVIEW_STEPS[interviewStep];
      if (!step) return;

      if (!trimmed) {
        setInputError("Vul dit veld in om verder te gaan.");
        return;
      }

      if (step.key === "email") {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(trimmed)) {
          setInputError("Vul een geldig e-mailadres in (bijv. naam@bedrijf.nl).");
          return;
        }
      }

      setInputError("");
      setAnswers((prev) => ({ ...prev, [step.key]: trimmed }));
      setCurrentInput("");
      setShowInput(false);
      setScreenText("");
      // Speler-antwoord in bubble tonen; korte leespauze, dan naar volgende vraag
      setPlayerReplyText(trimmed);
      setShowPlayerReply(true);
      const nextIdx = interviewStep + 1;
      const nextStep = INTERVIEW_STEPS[nextIdx];
      if (!nextStep) return;
      setTimeout(() => {
        setShowPlayerReply(false);
        setTypingDone(false);
        setInterviewStep(nextIdx);
        setPresenterFullText(nextStep.getPresenterText(playerName));
      }, 1800);
    },
    [interviewStep, playerName],
  );

  const handleAnswerSubmit = useCallback(
    () => submitAnswer(currentInput),
    [currentInput, submitAnswer],
  );

  // ── Reset all state (used when going back to gameshow from homepage) ──
  const handleReset = useCallback(() => {
    setShowHomepage(false);
    setPhase("idle");
    setPlayerName("");
    setNameInput("");
    setInterviewStep(-1);
    setPresenterFullText("");
    setPresenterTypedText("");
    setTypingDone(false);
    setShowInput(false);
    setCurrentInput("");
    setAnswers({});
    setIsComplete(false);
    setScreenText("");
    setWheelBudgets([]);
    setWheelTargetBudget("");
    setWheelSpinning(false);
    setWheelResult("");
    setWheelCanSpin(false);
    setEditingKey(null);
    setEditValue("");
    setPlayerReplyText("");
    setShowPlayerReply(false);
    setNameError("");
    setInputError("");
    setWheelError("");
    setEditError("");
    setIsSubmitting(false);
    setSubmitError("");
    setSubmitSuccess("");
  }, []);

  // ── Start ──
  const handleStart = useCallback(() => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setNameError("Vul je naam in om te beginnen.");
      nameInputRef.current?.focus();
      return;
    }
    setNameError("");
    setPlayerName(trimmed);
    setPhase("questionPlayer");
    setTimeout(() => {
      setInterviewStep(0);
      setPresenterFullText(INTERVIEW_STEPS[0].getPresenterText(trimmed));
    }, 400);
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
  const isQuestionPhase =
    phase === "questionPlayer" ||
    phase === "wheelZoom" ||
    phase === "tvBudget";
  const showPresenter = isQuestionPhase && interviewStep >= 0 && !isComplete;

  // Determine who is "aan het woord" for the spotlight:
  // - during input we highlight the player
  // - otherwise, when the game is running, we highlight the presenter
  const speaker: Speaker =
    phase === "idle" ? null : showInput ? "player" : "presenter";

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
          playerReplyText={playerReplyText}
          showPlayerReply={showPlayerReply}
          screenText={screenText}
          wheelBudgets={wheelBudgets}
          wheelTargetBudget={wheelTargetBudget}
          wheelSpinning={wheelSpinning}
          onWheelComplete={handleWheelComplete}
          speaker={speaker}
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

        {/* ── Click-to-skip typewriter: alleen wanneer geen invoer/knop/keuzes zichtbaar ── */}
        {showPresenter &&
          !typingDone &&
          !showInput &&
          !(
            phase === "wheelZoom" &&
            wheelCanSpin &&
            !wheelSpinning &&
            !wheelResult
          ) && (
          <div
            className="pointer-events-auto absolute inset-0 z-[5] cursor-pointer"
            onClick={skipTyping}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && skipTyping()}
            aria-label="Klik om te versnellen"
          >
            <p className="absolute bottom-24 left-1/2 -translate-x-1/2 font-pixel text-[9px] tracking-widest text-white/40">
              Klik om te versnellen
            </p>
          </div>
        )}

        {/* ── START screen ── */}
        {phase === "idle" && (
          <div className="pointer-events-auto absolute inset-0 flex flex-col items-center justify-center gap-8">
            <div className="pointer-events-none absolute inset-0 bg-black/55 backdrop-blur-[2px]" />
            <div className="relative z-10 text-center">
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
                onChange={(e) => {
                  setNameInput(e.target.value);
                  if (nameError) setNameError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder="Typ hier je naam..."
                autoFocus
                className="w-full border border-white/20 bg-white/6 px-4 py-3 text-base text-white placeholder-white/25 outline-none transition-all focus:border-[#c8ff00]/80 focus:bg-white/10"
              />
              {nameError && (
                <p className="mt-1 text-xs text-red-400">{nameError}</p>
              )}
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

        {/* ── Progress indicator ── */}
        {(phase === "questionPlayer" || phase === "wheelZoom") &&
          interviewStep > 0 &&
          !isComplete && (
            <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 z-10">
              <div className="flex items-center gap-1">
                {[
                  { label: "E-MAIL", si: 1 },
                  { label: "BEDRIJF", si: 2 },
                  { label: "PROJECT", si: 3 },
                  { label: "BUDGET", si: 4 },
                ].map(({ label, si }, i) => {
                  const done =
                    si < interviewStep || (si === 4 && !!wheelResult);
                  const active =
                    interviewStep === si || (si === 4 && phase === "wheelZoom");
                  return (
                    <div key={si} className="flex items-center gap-1">
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full border text-[9px] font-bold transition-all ${
                            done
                              ? "border-[#c8ff00] bg-[#c8ff00] text-black"
                              : active
                                ? "border-[#c8ff00] bg-[#c8ff00]/20 text-[#c8ff00]"
                                : "border-white/20 bg-white/5 text-white/30"
                          }`}
                        >
                          {done ? "✓" : si}
                        </div>
                        <span
                          className={`font-pixel text-[6px] tracking-widest ${
                            active
                              ? "text-[#c8ff00]"
                              : done
                                ? "text-white/50"
                                : "text-white/20"
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                      {i < 3 && (
                        <div
                          className={`mb-4 h-px w-8 ${done ? "bg-[#c8ff00]/50" : "bg-white/15"}`}
                        />
                      )}
                    </div>
                  );
                })}
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
                <span className="font-pixel text-[8px] tracking-[0.2em] text-[#c8ff00]/80">
                  {currentStep.label}
                </span>
                <input
                  ref={answerInputRef}
                  type={currentStep.inputType ?? "text"}
                  value={currentInput}
                  onChange={(e) => {
                    setCurrentInput(e.target.value);
                    if (inputError) setInputError("");
                  }}
                  onKeyDown={handleAnswerKeyDown}
                  placeholder={currentStep.placeholder}
                  className="w-full border border-white/20 bg-white/6 px-4 py-3 text-base text-white placeholder-white/25 outline-none transition-all focus:border-[#c8ff00]/70 focus:bg-white/10"
                />
                {inputError && (
                  <p className="text-xs text-red-400">{inputError}</p>
                )}
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

        {/* ── Buzzer buttons: project type ── */}
        {phase === "questionPlayer" &&
          showInput &&
          !isComplete &&
          currentStep?.isMultipleChoice && (
            <div className="pointer-events-auto absolute inset-x-0 bottom-0 flex justify-center p-4 pb-7">
              <div className="w-full max-w-2xl space-y-4 border border-white/10 bg-black/85 p-6 backdrop-blur-md">
                <span className="font-pixel text-[8px] tracking-[0.2em] text-[#c8ff00]/80">
                  {currentStep.label}
                </span>
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
                  {PROJECT_TYPES.map((pt, idx) => {
                    const buzzerColors = [
                      "#e63946",
                      "#f4a261",
                      "#2a9d8f",
                      "#457b9d",
                      "#9b5de5",
                      "#c8ff00",
                    ];
                    const color = buzzerColors[idx];
                    return (
                      <button
                        key={pt}
                        onClick={() => submitAnswer(pt)}
                        className="group flex flex-col items-center gap-2 transition-all"
                      >
                        <div
                          className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-black/40 shadow-[0_6px_0px_rgba(0,0,0,0.45)] transition-all group-hover:brightness-110 group-active:translate-y-[3px] group-active:shadow-[0_2px_0px_rgba(0,0,0,0.45)]"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-pixel text-[9px] tracking-widest text-white/70 transition-all group-hover:text-white">
                          {pt.toUpperCase()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        {/* ── Wheel spin button ── */}
        {phase === "wheelZoom" &&
          wheelCanSpin &&
          !wheelSpinning &&
          !wheelResult && (
            <div className="pointer-events-auto absolute left-1/2 bottom-20 -translate-x-1/2">
              <button
              onClick={() => {
                if (wheelSpinning) {
                  setWheelError("Het rad is al aan het draaien.");
                  return;
                }
                if (!wheelCanSpin) {
                  setWheelError("Je kunt het rad nu nog niet draaien.");
                  return;
                }
                if (!wheelBudgets.length) {
                  setWheelError(
                    "Er zijn geen budgetopties beschikbaar om op te draaien.",
                  );
                  return;
                }
                setWheelError("");
                setWheelCanSpin(false);
                setWheelSpinning(true);
              }}
                className="font-pixel border-2 border-[#c8ff00] bg-[#c8ff00] px-8 py-3 text-sm text-black shadow-[0_0_30px_rgba(200,255,0,0.5)] transition-all hover:bg-transparent hover:text-[#c8ff00] active:scale-95"
              >
                DRAAI HET RAD →
              </button>
            {wheelError && (
              <p className="mt-2 text-center text-xs text-red-400">
                {wheelError}
              </p>
            )}
            </div>
          )}

        {/* ── Complete / reward screen ── */}
        {isComplete && (
          <div className="pointer-events-auto absolute inset-0 overflow-y-auto bg-black/88 backdrop-blur-sm">
            <div className="flex min-h-full flex-col items-center justify-center px-4 py-10">
              {/* Header */}
              <div className="mb-8 text-center">
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 44 44"
                  fill="none"
                  className="mx-auto mb-4"
                >
                  <path
                    d="M22 4L26.5 15H38.5L28.5 22.5L32.5 34L22 27L11.5 34L15.5 22.5L5.5 15H17.5L22 4Z"
                    fill="#c8ff00"
                    stroke="#c8ff00"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="font-pixel text-[9px] tracking-[0.45em] text-[#c8ff00]">
                  MISSION
                </p>
                <h2 className="font-pixel text-4xl text-white sm:text-5xl">
                  COMPLETED
                </h2>
                <p className="mt-3 font-pixel text-sm tracking-[0.2em] text-white/60">
                  {playerName.toUpperCase()}
                </p>
              </div>

              {/* Two-column layout */}
              <div className="flex w-full max-w-2xl flex-col gap-5 sm:flex-row">
                {/* Left: mission summary */}
                <div className="flex flex-col justify-center gap-4 border border-[#c8ff00]/20 bg-[#c8ff00]/5 p-6 sm:w-56">
                  <div>
                    <p className="font-pixel text-[7px] tracking-[0.3em] text-[#c8ff00]/60">
                      BUDGET
                    </p>
                    <p className="mt-1 font-pixel text-xl text-[#c8ff00]">
                      {answers.budget ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="font-pixel text-[7px] tracking-[0.3em] text-[#c8ff00]/60">
                      PROJECT
                    </p>
                    <p className="mt-1 text-sm text-white/80">
                      {answers.projectType ?? "—"}
                    </p>
                  </div>
                  <div className="mt-2 border-t border-white/10 pt-4">
                    <p className="text-xs leading-5 text-white/40">
                      Je gegevens worden gebruikt om contact op te nemen.
                    </p>
                  </div>
                </div>

                {/* Right: editable form */}
                <div className="flex-1 border border-white/10 bg-black/40 p-6">
                  <p className="font-pixel mb-4 text-[8px] tracking-[0.25em] text-white/50">
                    JOUW GEGEVENS
                  </p>
                  {(
                    [
                      { key: "email", label: "E-MAIL", inputType: "email" },
                      { key: "company", label: "BEDRIJF", inputType: "text" },
                      {
                        key: "projectType",
                        label: "PROJECT",
                        inputType: "choice",
                      },
                    ] as { key: string; label: string; inputType: string }[]
                  ).map(({ key, label, inputType }) => (
                    <div
                      key={key}
                      className="border-b border-white/8 py-3 last:border-0"
                    >
                      {editingKey === key ? (
                        <div className="space-y-2">
                          <span className="font-pixel text-[7px] tracking-widest text-[#c8ff00]/60">
                            {label}
                          </span>
                          {inputType === "choice" ? (
                            <div className="mt-1 grid grid-cols-3 gap-1.5">
                              {PROJECT_TYPES.map((pt) => (
                                <button
                                  key={pt}
                                  onClick={() => {
                                    const projectBudgets =
                                      BUDGET_BY_PROJECT[pt] ?? DEFAULT_BUDGETS;
                                    const newBudget =
                                      projectBudgets[0] ?? DEFAULT_BUDGETS[0];
                                    setAnswers((prev) => ({
                                      ...prev,
                                      [key]: pt,
                                      budget: newBudget,
                                    }));
                                    setEditError("");
                                    setEditingKey(null);
                                  }}
                                  className={`font-pixel border py-1.5 text-[8px] tracking-widest transition-all ${
                                    answers[key] === pt
                                      ? "border-[#c8ff00] bg-[#c8ff00]/20 text-[#c8ff00]"
                                      : "border-white/20 bg-white/5 text-white/60 hover:border-[#c8ff00]/60 hover:text-[#c8ff00]"
                                  }`}
                                >
                                  {pt}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-1 flex gap-2">
                              <input
                                type={inputType}
                                value={editValue}
                                  onChange={(e) => {
                                    setEditValue(e.target.value);
                                    if (editError) setEditError("");
                                  }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      const trimmed = editValue.trim();
                                      if (!trimmed) {
                                        setEditError(
                                          "Dit veld mag niet leeg zijn.",
                                        );
                                        return;
                                      }
                                      if (inputType === "email") {
                                        const emailPattern =
                                          /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                        if (!emailPattern.test(trimmed)) {
                                          setEditError(
                                            "Vul een geldig e-mailadres in (bijv. naam@bedrijf.nl).",
                                          );
                                          return;
                                        }
                                      }
                                    setAnswers((prev) => ({
                                      ...prev,
                                        [key]: trimmed,
                                    }));
                                      setEditError("");
                                    setEditingKey(null);
                                  }
                                  if (e.key === "Escape") setEditingKey(null);
                                }}
                                autoFocus
                                className="flex-1 border border-[#c8ff00]/40 bg-white/6 px-3 py-1.5 text-sm text-white outline-none focus:border-[#c8ff00]/70"
                              />
                              <button
                                onClick={() => {
                                    const trimmed = editValue.trim();
                                    if (!trimmed) {
                                      setEditError("Dit veld mag niet leeg zijn.");
                                      return;
                                    }
                                    if (inputType === "email") {
                                      const emailPattern =
                                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                      if (!emailPattern.test(trimmed)) {
                                        setEditError(
                                          "Vul een geldig e-mailadres in (bijv. naam@bedrijf.nl).",
                                        );
                                        return;
                                      }
                                    }
                                    setAnswers((prev) => ({
                                      ...prev,
                                      [key]: trimmed,
                                    }));
                                    setEditError("");
                                  setEditingKey(null);
                                }}
                                className="border border-[#c8ff00]/40 bg-[#c8ff00]/10 px-3 py-1.5 text-[#c8ff00] transition-all hover:bg-[#c8ff00] hover:text-black"
                              >
                                ✓
                              </button>
                            </div>
                          )}
                            {editError && (
                              <p className="text-xs text-red-400">{editError}</p>
                            )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="font-pixel text-[7px] tracking-widest text-[#c8ff00]/50">
                            {label}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-white/75">
                              {answers[key] ?? "—"}
                            </span>
                            <button
                              onClick={() => {
                                setEditingKey(key);
                                setEditValue(answers[key] ?? "");
                              }}
                              className="text-[11px] text-white/25 transition-all hover:text-[#c8ff00]"
                              title="Aanpassen"
                            >
                              ✎
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={async () => {
                      if (editingKey) {
                        setSubmitError("Rond eerst je bewerking af voordat je verzendt.");
                        return;
                      }
                      if (!answers.email || !answers.company || !answers.projectType || !answers.budget) {
                        setSubmitError(
                          "Niet alle velden zijn ingevuld. Controleer e‑mail, bedrijf, project en budget.",
                        );
                        return;
                      }
                      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (!emailPattern.test(answers.email)) {
                        setSubmitError(
                          "Het e-mailadres lijkt niet geldig. Gebruik bijv. naam@bedrijf.nl.",
                        );
                        return;
                      }

                      try {
                        setSubmitError("");
                        setSubmitSuccess("");
                        setIsSubmitting(true);

                        // Hier zou normaal een API‑call komen om de lead te versturen.
                        // Voor nu simuleren we een korte wachttijd.
                        await new Promise((resolve) => setTimeout(resolve, 900));

                        setSubmitSuccess("Je gegevens zijn succesvol verzonden. We sturen je terug naar de homepage.");
                        // Korte delay zodat de speler het bericht kan lezen
                        setTimeout(() => {
                          setShowHomepage(true);
                        }, 1800);
                      } catch (err) {
                        setSubmitError(
                          `Er ging iets mis bij het verzenden van je gegevens. Probeer het opnieuw of neem direct contact op. ${
                            err instanceof Error ? `Details: ${err.message}` : ""
                          }`,
                        );
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    disabled={!!editingKey || isSubmitting}
                    className="font-pixel mt-5 w-full border-2 border-[#c8ff00] bg-[#c8ff00] py-3.5 text-sm text-black transition-all hover:bg-transparent hover:text-[#c8ff00] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isSubmitting ? "VERZENDEN..." : "VERZENDEN →"}
                  </button>
                  {submitError && (
                    <p className="mt-2 text-xs text-red-400">{submitError}</p>
                  )}
                  {submitSuccess && (
                    <p className="mt-2 text-xs text-[#c8ff00]">{submitSuccess}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Close button (top-right) ── */}
      {!showHomepage && (
        <button
          onClick={() => {
            // Volledige reset van de gameshow‑state zodat alle teksten,
            // overlays, inputs en animaties stoppen, en daarna naar homepage.
            handleReset();
            setShowHomepage(true);
          }}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center border border-white/20 bg-black/60 text-white/60 backdrop-blur-sm transition-all hover:border-white/50 hover:text-white active:scale-95"
          title="Sluiten"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="1" y1="1" x2="13" y2="13" />
            <line x1="13" y1="1" x2="1" y2="13" />
          </svg>
        </button>
      )}

      {/* ── Livewall homepage screenshot overlay ── */}
      {showHomepage && (
        <div className="absolute inset-0 z-40 flex flex-col">
          <div className="relative h-full w-full">
            <Image
              src="/livewall-homepage-v2.png"
              alt="Livewall Homepage"
              fill
              className="object-cover object-top"
              priority
            />
          </div>
          {/* Contact button overlay – Livewall-stijl, rechts in navbar */}
          <div className="absolute inset-0 flex items-start justify-end pt-[2.5rem] pr-[4rem] md:pt-[2.75rem] md:pr-[4.5rem]">
            <button
              onClick={handleReset}
              className="font-pixel rounded-lg bg-[#c8ff00] px-5 py-2.5 text-sm font-medium tracking-wide text-black shadow-[0_0_20px_rgba(200,255,0,0.45)] transition-all duration-200 hover:bg-[#0a0a0a] hover:text-[#c8ff00] hover:shadow-[0_0_24px_rgba(200,255,0,0.5)] active:scale-95"
            >
              CONTACT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
