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
  const texture = useTexture("/images/livewall-logo.svg");
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
    <Html
      position={[0.3, 2.6, 1.5]}
      center
      zIndexRange={[0, 0]}
      style={{ pointerEvents: "none" }}
    >
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
  speaker,
}: {
  phase: GamePhase;
  playerName: string;
  greetingText: string;
  showGreeting: boolean;
  playerReplyText: string;
  showPlayerReply: boolean;
  screenText: string;
  speaker: Speaker;
}) {
  const screenActive = phase !== "idle" && !!playerName;
  const isIdle = phase === "idle";
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

type LivewallCategory =
  | "Branded Games"
  | "Interactieve Campagnes"
  | "Platforms & Apps"
  | "Gamification & Loyalty"
  | "Events & Experiences"
  | "Community & Engagement";

type BudgetRangeId = "2000-5000" | "5000-10000" | "10000-20000" | "20000+";

const LIVEWALL_CATEGORIES: { id: LivewallCategory; title: LivewallCategory }[] =
  [
    { id: "Branded Games", title: "Branded Games" },
    { id: "Interactieve Campagnes", title: "Interactieve Campagnes" },
    { id: "Platforms & Apps", title: "Platforms & Apps" },
    { id: "Gamification & Loyalty", title: "Gamification & Loyalty" },
    { id: "Events & Experiences", title: "Events & Experiences" },
    { id: "Community & Engagement", title: "Community & Engagement" },
  ];

const BUDGET_RANGES: { id: BudgetRangeId; label: string; hint: string }[] = [
  { id: "2000-5000", label: "€2.000 – €5.000", hint: "Klein / MVP" },
  { id: "5000-10000", label: "€5.000 – €10.000", hint: "Compact" },
  { id: "10000-20000", label: "€10.000 – €20.000", hint: "Uitgebreid" },
  { id: "20000+", label: "€20.000+", hint: "Groot" },
];

type PastProject = {
  id: string;
  title: string;
  category: LivewallCategory;
  budgetRange: BudgetRangeId;
  tagline: string;
};

const PAST_PROJECTS: PastProject[] = [
  {
    id: "bg-arcade-quiz",
    title: "Branded arcade quiz experience",
    category: "Branded Games",
    budgetRange: "5000-10000",
    tagline: "Snel spelconcept met merk-identiteit en score/leaderboard.",
  },
  {
    id: "bg-webgame-launch",
    title: "Webgame voor productlancering",
    category: "Branded Games",
    budgetRange: "10000-20000",
    tagline: "Browsergame met rewards en social share loops.",
  },
  {
    id: "ic-scratch-win",
    title: "Interactieve scratch & win campagne",
    category: "Interactieve Campagnes",
    budgetRange: "2000-5000",
    tagline: "Korte activatie met instant-win mechanics en lead capture.",
  },
  {
    id: "ic-ugc-challenge",
    title: "UGC challenge met live ranking",
    category: "Interactieve Campagnes",
    budgetRange: "20000+",
    tagline: "Meerdere weken campagne met content submissions en moderatie.",
  },
  {
    id: "pa-event-companion",
    title: "Event companion webapp",
    category: "Platforms & Apps",
    budgetRange: "10000-20000",
    tagline: "Interactie, planning en push-achtige updates in 1 flow.",
  },
  {
    id: "pa-microsite-platform",
    title: "Campagneplatform + microsites",
    category: "Platforms & Apps",
    budgetRange: "20000+",
    tagline: "Multi-page platform met beheer en herbruikbare modules.",
  },
  {
    id: "gl-stamp-card",
    title: "Digitale stempelkaart",
    category: "Gamification & Loyalty",
    budgetRange: "5000-10000",
    tagline: "Progressie, beloningen en eenvoudige segmentatie.",
  },
  {
    id: "gl-tiered-rewards",
    title: "Loyalty tiers & rewards",
    category: "Gamification & Loyalty",
    budgetRange: "20000+",
    tagline: "Levels, challenges en integratie met bestaande systemen.",
  },
  {
    id: "ee-live-activation",
    title: "Live event activation wall",
    category: "Events & Experiences",
    budgetRange: "10000-20000",
    tagline: "Publieksinteractie op locatie met real-time visuals.",
  },
  {
    id: "ee-stand-experience",
    title: "Beursstand experience game",
    category: "Events & Experiences",
    budgetRange: "20000+",
    tagline: "Custom experience met meerdere interactiepunten en content.",
  },
  {
    id: "ce-community-quest",
    title: "Community quest met badges",
    category: "Community & Engagement",
    budgetRange: "5000-10000",
    tagline: "Badges, challenges en engagement loops voor leden.",
  },
  {
    id: "ce-fan-hub",
    title: "Fan hub met challenges",
    category: "Community & Engagement",
    budgetRange: "10000-20000",
    tagline: "Content hub + gamified deelname en leaderboard.",
  },
];

function getSimilarProjects(category: LivewallCategory, budgetRange: BudgetRangeId) {
  const exact = PAST_PROJECTS.filter(
    (p) => p.category === category && p.budgetRange === budgetRange,
  );
  if (exact.length >= 3) return exact.slice(0, 3);
  const sameCategory = PAST_PROJECTS.filter((p) => p.category === category);
  const sameBudget = PAST_PROJECTS.filter((p) => p.budgetRange === budgetRange);
  const merged = [...exact];
  for (const p of [...sameCategory, ...sameBudget]) {
    if (merged.some((m) => m.id === p.id)) continue;
    merged.push(p);
    if (merged.length >= 3) break;
  }
  return merged.slice(0, 3);
}

const INTERVIEW_STEPS: InterviewStep[] = [
  {
    key: "intro",
    getPresenterText: (name) =>
      `Welkom, ${name}! Fijn dat je er bent. Kies je route, speel mee en win een prijs.`,
    hasInput: false,
  },
  {
    key: "category",
    label: "KIES CATEGORIE + BUDGET",
    getPresenterText: () =>
      "Kies op het bord eerst een categorie en daarna je budgetniveau.",
    hasInput: true,
    isMultipleChoice: true,
    showOnScreen: true,
  },
  {
    key: "examples",
    getPresenterText: () =>
      "Check! Hieronder zie je een paar soortgelijke projecten die we eerder hebben gemaakt.",
    hasInput: true,
  },
  {
    key: "email",
    label: "E-MAILADRES",
    getPresenterText: () =>
      "Lekker gespeeld! Je hebt een prijs gewonnen. Naar welk e-mailadres mogen we die sturen?",
    placeholder: "naam@bedrijf.nl",
    inputType: "email",
    hasInput: true,
    showOnScreen: true,
  },
  {
    key: "company",
    label: "BEDRIJFSNAAM",
    getPresenterText: () =>
      "Top! En wat is de naam van je bedrijf voor de prijsregistratie?",
    placeholder: "Bijv. Livewall BV",
    inputType: "text",
    hasInput: true,
    showOnScreen: true,
  },
  {
    key: "outro",
    getPresenterText: (name) =>
      `Fantastisch, ${name}! Je prijs is geclaimd. We nemen snel contact met je op!`,
    hasInput: false,
    isOutro: true,
  },
];

// (oude projecttypes + budget-rad zijn vervangen door categorie + prijsgroep)

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
  const [boardCategoryChoice, setBoardCategoryChoice] =
    useState<LivewallCategory | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [screenText, setScreenText] = useState("");
  const [playerReplyText, setPlayerReplyText] = useState("");
  const [showPlayerReply, setShowPlayerReply] = useState(false);

  // ── Error state ──
  const [nameError, setNameError] = useState("");
  const [inputError, setInputError] = useState("");
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

    if (interviewStep < 0) return;
    const step = INTERVIEW_STEPS[interviewStep];
    if (!step) return;

    if (step.isOutro) {
      // Korte leespauze na outro-tekst, dan naar eindscherm
      const t = setTimeout(() => setIsComplete(true), 1400);
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

    // Korte leespauze na vraag van presentator, dan invoer/keuzes tonen
    const t = setTimeout(() => {
      setShowInput(true);
      setTimeout(() => answerInputRef.current?.focus(), 60);
    }, 700);
    return () => clearTimeout(t);
  }, [typingDone, interviewStep, playerName, answers, phase]);

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
    setBoardCategoryChoice(null);
    setIsComplete(false);
    setScreenText("");
    setEditingKey(null);
    setEditValue("");
    setPlayerReplyText("");
    setShowPlayerReply(false);
    setNameError("");
    setInputError("");
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
  const isQuestionPhase = phase === "questionPlayer";
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
          speaker={speaker}
        />
      </Canvas>

      {/* ── 2D overlay ── */}
      <div className="pointer-events-none absolute inset-0 z-10">
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
          (
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
        {phase === "questionPlayer" &&
          interviewStep > 0 &&
          !isComplete && (
            <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 z-10">
              <div className="flex items-center gap-1">
                {[
                  { label: "BORD", si: 1 },
                  { label: "VOORBEELDEN", si: 2 },
                  { label: "E-MAIL", si: 3 },
                  { label: "BEDRIJF", si: 4 },
                ].map(({ label, si }, i) => {
                  const done = si < interviewStep;
                  const active = interviewStep === si;
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

        {/* ── Interactieve keuzes ── */}
        {phase === "questionPlayer" && showInput && !isComplete && currentStep && (
          <div className="pointer-events-auto absolute inset-x-0 bottom-0 flex justify-center p-4 pb-7">
            {/* Categorie board (Jeopardy-achtig) */}
            {currentStep.key === "category" && (
              <div className="w-full max-w-5xl space-y-2 border border-white/15 bg-black/85 p-3 backdrop-blur-md">
                <div className="grid grid-cols-2 gap-[3px] bg-black/60 p-[3px] sm:grid-cols-3 lg:grid-cols-6">
                  {LIVEWALL_CATEGORIES.map((c) => {
                    const activeColumn = boardCategoryChoice === c.id;
                    return (
                      <div
                        key={c.id}
                        className={`border ${
                          activeColumn
                            ? "border-[#c8ff00]/90 shadow-[0_0_0_1px_rgba(200,255,0,0.25)]"
                            : "border-white/15"
                        }`}
                      >
                        <button
                          onClick={() => setBoardCategoryChoice(c.id)}
                          className={`flex h-16 w-full items-center justify-center border-b border-white/10 px-1 text-center transition-all ${
                            activeColumn
                              ? "bg-[#c8ff00]/18"
                              : "bg-white/5 hover:bg-white/10"
                          }`}
                        >
                          <span
                            className={`font-pixel text-[8px] leading-3 tracking-wide ${
                              activeColumn ? "text-[#c8ff00]" : "text-white"
                            }`}
                          >
                            {c.title.toUpperCase()}
                          </span>
                        </button>

                        <div className="grid grid-cols-2 gap-[2px] bg-black/40 p-[2px] lg:grid-cols-1">
                          {BUDGET_RANGES.map((b) => {
                            const disabled = !activeColumn;
                            return (
                              <button
                                key={`${c.id}-${b.id}`}
                                disabled={disabled}
                                onClick={() => {
                                  if (!boardCategoryChoice) return;
                                  const category = boardCategoryChoice;
                                  setAnswers((prev) => ({
                                    ...prev,
                                    category,
                                    budgetRange: b.id,
                                  }));
                                  setBoardCategoryChoice(null);
                                  setCurrentInput("");
                                  setShowInput(false);
                                  setScreenText("");
                                  setPlayerReplyText(`${category} • ${b.label}`);
                                  setShowPlayerReply(true);
                                  const nextIdx = interviewStep + 1;
                                  const nextStep = INTERVIEW_STEPS[nextIdx];
                                  if (!nextStep) return;
                                  setTimeout(() => {
                                    setShowPlayerReply(false);
                                    setTypingDone(false);
                                    setInterviewStep(nextIdx);
                                    setPresenterFullText(
                                      nextStep.getPresenterText(playerName),
                                    );
                                  }, 1500);
                                }}
                                className={`flex h-14 w-full items-center justify-center px-1 transition-all lg:h-16 ${
                                  disabled
                                    ? "cursor-not-allowed border border-white/10 bg-white/5 text-[#c8ff00]/30"
                                    : "border border-white/15 bg-black/75 text-[#c8ff00] hover:border-[#c8ff00]/70 hover:bg-[#c8ff00]/10 hover:text-[#e6ff80]"
                                }`}
                              >
                                <span className="font-pixel text-[12px] tracking-wide lg:text-[14px]">
                                  {b.id === "2000-5000"
                                    ? "€2K"
                                    : b.id === "5000-10000"
                                      ? "€5K"
                                      : b.id === "10000-20000"
                                        ? "€10K"
                                        : "€20K+"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="font-pixel text-[8px] tracking-wide text-white/50">
                  {!boardCategoryChoice
                    ? "KIES EERST EEN CATEGORIE, DAARNA EEN BUDGETVAK"
                    : `GEKOZEN: ${boardCategoryChoice.toUpperCase()}`}
                </div>
              </div>
            )}

            {/* Examples / similar projects */}
            {currentStep.key === "examples" && (
              <div className="w-full max-w-3xl space-y-4 border border-white/10 bg-black/85 p-6 backdrop-blur-md">
                <div className="flex flex-col gap-1">
                  <span className="font-pixel text-[8px] tracking-[0.2em] text-[#c8ff00]/80">
                    SOORTGELIJKE PROJECTEN
                  </span>
                  <p className="text-xs text-white/55">
                    Op basis van{" "}
                    <span className="text-white/80">
                      {answers.category ?? "—"}
                    </span>{" "}
                    en{" "}
                    <span className="text-white/80">
                      {BUDGET_RANGES.find((b) => b.id === answers.budgetRange)
                        ?.label ?? "—"}
                    </span>
                  </p>
                </div>

                {answers.category && answers.budgetRange ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {getSimilarProjects(
                      answers.category as LivewallCategory,
                      answers.budgetRange as BudgetRangeId,
                    ).map((p) => (
                      <div
                        key={p.id}
                        className="border border-white/10 bg-white/5 p-4"
                      >
                        <p className="font-pixel text-[10px] tracking-widest text-white">
                          {p.title.toUpperCase()}
                        </p>
                        <p className="mt-2 text-xs text-white/55">{p.tagline}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="text-[10px] text-[#c8ff00]/90">
                            {p.category}
                          </span>
                          <span className="text-[10px] text-white/35">•</span>
                          <span className="text-[10px] text-white/55">
                            {
                              BUDGET_RANGES.find((b) => b.id === p.budgetRange)
                                ?.label
                            }
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white/60">
                    Kies eerst een categorie en prijsgroep om voorbeelden te zien.
                  </p>
                )}

                <button
                  onClick={() => {
                    // Ga door naar de volgende stap (outro of vervolgvraag)
                    setShowInput(false);
                    setScreenText("");
                    const nextIdx = interviewStep + 1;
                    const nextStep = INTERVIEW_STEPS[nextIdx];
                    if (!nextStep) return;
                    setTypingDone(false);
                    setInterviewStep(nextIdx);
                    setPresenterFullText(nextStep.getPresenterText(playerName));
                  }}
                  className="font-pixel w-full border-2 border-[#c8ff00]/70 bg-[#c8ff00] py-3 text-sm text-black transition-all hover:bg-transparent hover:text-[#c8ff00] active:scale-95"
                >
                  VOLGENDE →
                </button>
              </div>
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
                      {BUDGET_RANGES.find((b) => b.id === answers.budgetRange)
                        ?.label ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="font-pixel text-[7px] tracking-[0.3em] text-[#c8ff00]/60">
                      CATEGORIE
                    </p>
                    <p className="mt-1 text-sm text-white/80">
                      {answers.category ?? "—"}
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
                      if (!answers.email || !answers.company || !answers.category || !answers.budgetRange) {
                        setSubmitError(
                          "Niet alle velden zijn ingevuld. Controleer e‑mail, bedrijf, categorie en budget.",
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
              src="/images/livewall-homepage-v2.png"
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
