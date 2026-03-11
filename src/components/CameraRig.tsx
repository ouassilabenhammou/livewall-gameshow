"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export type GamePhase =
  | "idle"
  | "toPlayer"
  | "toPresenter"
  | "zoomIn"
  | "question"
  | "questionPlayer"
  | "wheelZoom"
  | "tvBudget";

interface CameraTarget {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  lerpSpeed: number;
}

// Player is at x=-2.5, Presenter at x=1.5 — center is x=-0.5
const CAMERA_TARGETS: Record<GamePhase, CameraTarget> = {
  idle: {
    position: new THREE.Vector3(-0.5, 3.8, 10),
    lookAt: new THREE.Vector3(-0.5, 0.8, 0),
    lerpSpeed: 0.02,
  },
  toPlayer: {
    position: new THREE.Vector3(-2.5, 2.0, 4.5),
    lookAt: new THREE.Vector3(-2.5, 1.2, 0),
    lerpSpeed: 0.028,
  },
  toPresenter: {
    // Pan from player toward presenter, both still loosely in frame
    position: new THREE.Vector3(1.0, 2.2, 5.2),
    lookAt: new THREE.Vector3(0.0, 1.2, 0),
    lerpSpeed: 0.018,
  },
  zoomIn: {
    // Two-shot: camera steps in but keeps both characters visible
    position: new THREE.Vector3(0.5, 2.0, 4.8),
    lookAt: new THREE.Vector3(-0.4, 1.3, 0),
    lerpSpeed: 0.022,
  },
  question: {
    position: new THREE.Vector3(0.5, 2.0, 4.8),
    lookAt: new THREE.Vector3(-0.4, 1.3, 0),
    lerpSpeed: 0.015,
  },
  // Centered zoom: player + presenter + TV screen all in frame
  questionPlayer: {
    position: new THREE.Vector3(0, 3.6, 7.5),
    lookAt: new THREE.Vector3(-0.3, 1.8, -1.2),
    lerpSpeed: 0.08,
  },
  // Close-up on the budget wheel near presenter
  wheelZoom: {
    position: new THREE.Vector3(-3.2, 2.5, 4.6),
    lookAt: new THREE.Vector3(-2.8, 1.85, -0.2),
    lerpSpeed: 0.02,
  },
  // Focus on TV screen so budget text is clearly visible
  tvBudget: {
    position: new THREE.Vector3(0, 3.6, 7.5),
    lookAt: new THREE.Vector3(-0.3, 1.8, -1.2),
    lerpSpeed: 0.02,
  },
};

export default function CameraRig({ phase }: { phase: GamePhase }) {
  const { camera } = useThree();
  const currentLookAt = useRef(new THREE.Vector3(-0.5, 0.8, 0));
  const initialized = useRef(false);

  useFrame(() => {
    const target = CAMERA_TARGETS[phase];

    if (!initialized.current) {
      camera.position.copy(CAMERA_TARGETS.idle.position);
      currentLookAt.current.copy(CAMERA_TARGETS.idle.lookAt);
      camera.lookAt(currentLookAt.current);
      initialized.current = true;
      return;
    }

    camera.position.lerp(target.position, target.lerpSpeed);
    currentLookAt.current.lerp(target.lookAt, target.lerpSpeed);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
