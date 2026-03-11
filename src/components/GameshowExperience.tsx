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
    <Html position={[1.6, 2.0, 0]} center style={{ pointerEvents: "none" }}>
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
    <Html position={[-1.8, 2.0, 0]} center style={{ pointerEvents: "none" }}>
      <div
        style={{
          background: "rgba(5,5,10,0.92)",
          border: "1.5px solid #c8ff00",
          borderRadius: "4px",
          padding: "8px 14px",
          color: "white",
          fontSize: "13px",
          fontWeight: 600,
          whiteSpace: "nowrap",
          minWidth: "160px",
          textAlign: "center",
          backdropFilter: "blur(10px)",
          boxShadow: "0 0 18px rgba(200,255,0,0.2)",
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
          SPELER
        </span>
        {text}
        {/* Tail pointing up-right toward player */}
        <div
          style={{
            position: "absolute",
            bottom: "-10px",
            right: "26px",
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

// ─── Kleine bewegende achtergrondlampen ──────────────────────────────────────

function BackgroundMovingLights({ active }: { active: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!active || !groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const radius = 6.5 + i * 0.8;
      const speed = 0.12 + i * 0.04;
      const y = 6.0 + Math.sin(t * 0.5 + i) * 0.5;
      const x = Math.cos(t * speed + i * 1.3) * radius;
      const z = -4.0 + Math.sin(t * speed * 0.9 + i) * 1.8;
      child.position.set(x, y, z);
    });
  });

  return (
    <group ref={groupRef} visible={active}>
      {[0, 1, 2, 3].map((i) => (
        <group key={i}>
          <mesh>
            <sphereGeometry args={[0.16, 12, 12]} />
            <meshStandardMaterial
              color={LW_LIME}
              emissive={LW_LIME}
              emissiveIntensity={1.6}
            />
          </mesh>
          <pointLight
            intensity={2.0}
            color={LW_LIME}
            distance={18}
            decay={1.3}
          />
        </group>
      ))}
    </group>
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

      {/* Kleine bewegende lampen in de achtergrond, pas na start */}
      <BackgroundMovingLights active={active} />
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
      <TVScreen active={screenActive} questionText={screenText || undefined} />
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
    // Positioned to the other side of the studio on stage
    <group position={[-2.8, STAGE_TOP_Y, 0.2]}>
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
  const [playerReplyText, setPlayerReplyText] = useState("");
  const [showPlayerReply, setShowPlayerReply] = useState(false);

  // ── Wheel state ──
  const [wheelBudgets, setWheelBudgets] = useState<string[]>([]);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState("");
  const [wheelCanSpin, setWheelCanSpin] = useState(false);

  // ── Homepage / send state ──
  const [showHomepage, setShowHomepage] = useState(false);
  const [showSendPopup, setShowSendPopup] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

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
      setWheelResult("");
      setWheelSpinning(false);
      setWheelCanSpin(false);
      const t = setTimeout(() => {
        setPhase("wheelZoom");
        setWheelCanSpin(true);
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
      setWheelCanSpin(false);
      setWheelResult(result);
      setAnswers((prev) => ({ ...prev, budget: result }));
      setScreenText(`BUDGET: ${result}`);
      // After result: first move camera to TV screen, then advance to outro
      const outroIdx = INTERVIEW_STEPS.findIndex((s) => s.isOutro);
      // Short pause on the wheel result overlay
      setTimeout(() => {
        setPhase("tvBudget");
      }, 800);
      // Then move back to presenter for outro
      setTimeout(() => {
        setPhase("questionPlayer");
        setScreenText("");
        setInterviewStep(outroIdx);
        setPresenterFullText(
          INTERVIEW_STEPS[outroIdx].getPresenterText(playerName),
        );
      }, 4000);
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
      // Show player's answer briefly as a speech bubble
      setPlayerReplyText(val);
      setShowPlayerReply(true);
      setTimeout(() => {
        setShowPlayerReply(false);
      }, 2600);
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
    setWheelSpinning(false);
    setWheelResult("");
    setWheelCanSpin(false);
    setEditingKey(null);
    setEditValue("");
    setPlayerReplyText("");
    setShowPlayerReply(false);
  }, []);

  // ── Send confirmation → go to homepage ──
  const handleSendConfirm = useCallback(() => {
    setShowSendPopup(false);
    setShowHomepage(true);
  }, []);

  // ── Start ──
  const handleStart = useCallback(() => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setPlayerName(trimmed);
    setPhase("questionPlayer");
    setTimeout(() => {
      setInterviewStep(0);
      setPresenterFullText(INTERVIEW_STEPS[0].getPresenterText(trimmed));
    }, 900);
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
  const isQuestionPhase = phase === "questionPlayer" || phase === "wheelZoom";
  const showPresenter = isQuestionPhase && interviewStep >= 0 && !isComplete;
  // Name chip: only during camera travel (not question or idle)
  const showNameChip =
    phase !== "idle" &&
    phase !== "questionPlayer" &&
    phase !== "wheelZoom" &&
    playerName;

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
                <span className="font-pixel text-[8px] tracking-[0.2em] text-[#c8ff00]/80">
                  {currentStep.label}
                </span>
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
                <span className="font-pixel text-[8px] tracking-[0.2em] text-[#c8ff00]/80">
                  {currentStep.label}
                </span>
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

        {/* ── Wheel spin button ── */}
        {phase === "wheelZoom" &&
          wheelCanSpin &&
          !wheelSpinning &&
          !wheelResult && (
            <div className="pointer-events-auto absolute left-1/2 bottom-20 -translate-x-1/2">
              <button
                onClick={() => {
                  if (!wheelCanSpin || wheelSpinning || wheelResult) return;
                  setWheelCanSpin(false);
                  setWheelSpinning(true);
                }}
                className="font-pixel border-2 border-[#c8ff00] bg-[#c8ff00] px-8 py-3 text-sm text-black shadow-[0_0_30px_rgba(200,255,0,0.5)] transition-all hover:bg-transparent hover:text-[#c8ff00] active:scale-95"
              >
                DRAAI HET RAD →
              </button>
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
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-sm bg-black/70 px-10 py-6 text-center shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-sm">
              <p className="font-pixel mb-3 text-[10px] tracking-[0.4em] text-[#c8ff00]">
                BUDGET
              </p>
              <p className="font-pixel text-5xl text-white drop-shadow-[0_0_25px_rgba(0,0,0,0.9)]">
                {wheelResult}
              </p>
            </div>
          </div>
        )}

        {/* ── Complete screen ── */}
        {isComplete && (
          <div className="pointer-events-auto absolute inset-0 flex flex-col items-center justify-center gap-6 bg-black/75 backdrop-blur-sm overflow-y-auto py-8">
            <div className="text-center">
              <p className="font-pixel mb-3 text-[9px] tracking-[0.35em] text-[#c8ff00]">
                VOLTOOID
              </p>
              <h2 className="font-pixel text-3xl text-white">
                Bedankt, {playerName}!
              </h2>
              <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-white/55">
                Controleer je antwoorden en klik op verzenden.
              </p>
            </div>
            <div className="w-full max-w-sm border border-white/10 px-6 py-4">
              {(
                [
                  { key: "email", label: "E-mail", inputType: "email" },
                  { key: "company", label: "Bedrijf", inputType: "text" },
                  { key: "projectType", label: "Project", inputType: "choice" },
                  { key: "budget", label: "Budget", inputType: "readonly" },
                ] as { key: string; label: string; inputType: string }[]
              ).map(({ key, label, inputType }) =>
                answers[key] ? (
                  <div
                    key={key}
                    className="border-b border-white/10 py-3 last:border-0"
                  >
                    {editingKey === key ? (
                      <div className="space-y-2">
                        <span className="font-pixel text-[8px] tracking-widest text-[#c8ff00]/60">
                          {label.toUpperCase()}
                        </span>
                        {inputType === "choice" ? (
                          <div className="mt-1 grid grid-cols-3 gap-1.5">
                            {PROJECT_TYPES.map((pt) => (
                              <button
                                key={pt}
                                onClick={() => {
                                  setAnswers((prev) => ({
                                    ...prev,
                                    [key]: pt,
                                  }));
                                  setEditingKey(null);
                                }}
                                className={`font-pixel border py-2 text-[9px] tracking-widest transition-all ${
                                  answers[key] === pt
                                    ? "border-[#c8ff00] bg-[#c8ff00]/20 text-[#c8ff00]"
                                    : "border-white/20 bg-white/5 text-white/70 hover:border-[#c8ff00]/60 hover:text-[#c8ff00]"
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
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && editValue.trim()) {
                                  setAnswers((prev) => ({
                                    ...prev,
                                    [key]: editValue.trim(),
                                  }));
                                  setEditingKey(null);
                                }
                                if (e.key === "Escape") setEditingKey(null);
                              }}
                              autoFocus
                              className="flex-1 border border-[#c8ff00]/40 bg-white/6 px-3 py-1.5 text-sm text-white outline-none focus:border-[#c8ff00]/70"
                            />
                            <button
                              onClick={() => {
                                if (editValue.trim()) {
                                  setAnswers((prev) => ({
                                    ...prev,
                                    [key]: editValue.trim(),
                                  }));
                                }
                                setEditingKey(null);
                              }}
                              className="border border-[#c8ff00]/40 bg-[#c8ff00]/10 px-3 py-1.5 text-[#c8ff00] transition-all hover:bg-[#c8ff00] hover:text-black"
                            >
                              ✓
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="font-pixel text-[8px] tracking-widest text-[#c8ff00]/60">
                          {label.toUpperCase()}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-white/75">
                            {answers[key]}
                          </span>
                          {inputType !== "readonly" && (
                            <button
                              onClick={() => {
                                setEditingKey(key);
                                setEditValue(answers[key] ?? "");
                              }}
                              className="font-pixel text-[10px] text-white/30 transition-all hover:text-[#c8ff00]"
                              title="Aanpassen"
                            >
                              ✎
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null,
              )}
            </div>
            <button
              onClick={() => setShowSendPopup(true)}
              disabled={!!editingKey}
              className="font-pixel w-full max-w-sm border-2 border-[#c8ff00] bg-[#c8ff00] py-4 text-sm text-black transition-all hover:bg-transparent hover:text-[#c8ff00] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              VERZENDEN →
            </button>
          </div>
        )}
      </div>

      {/* ── Close button (top-right) ── */}
      {!showHomepage && (
        <button
          onClick={() => setShowHomepage(true)}
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
              src="/livewall-homepage.png"
              alt="Livewall Homepage"
              fill
              className="object-cover object-top"
              priority
            />
          </div>
          {/* Contact button overlay */}
          <div className="absolute inset-0 flex items-end justify-center pb-16">
            <button
              onClick={handleReset}
              className="font-pixel border-2 border-[#c8ff00] bg-[#c8ff00] px-10 py-4 text-sm text-black shadow-[0_0_30px_rgba(200,255,0,0.4)] transition-all hover:bg-transparent hover:text-[#c8ff00] active:scale-95"
            >
              NEEM CONTACT OP →
            </button>
          </div>
        </div>
      )}

      {/* ── Send confirmation popup ── */}
      {showSendPopup && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm border border-white/15 bg-[#05050e] px-8 py-10 text-center shadow-[0_0_60px_rgba(0,0,0,0.8)]">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border-2 border-[#c8ff00] bg-[#c8ff00]/10">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#c8ff00"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="font-pixel mb-2 text-[9px] tracking-[0.3em] text-[#c8ff00]">
              VERZONDEN!
            </p>
            <h3 className="font-pixel mb-3 text-xl text-white">Bedankt!</h3>
            <p className="mx-auto mb-8 max-w-xs text-sm leading-6 text-white/55">
              Je aanvraag is succesvol verstuurd. We nemen zo snel mogelijk
              contact met je op.
            </p>
            <button
              onClick={handleSendConfirm}
              className="font-pixel w-full border-2 border-[#c8ff00] bg-[#c8ff00] py-4 text-sm text-black transition-all hover:bg-transparent hover:text-[#c8ff00] active:scale-95"
            >
              OK →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
