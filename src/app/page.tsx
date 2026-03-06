"use client";

import dynamic from "next/dynamic";

const GameshowExperience = dynamic(
  () => import("@/components/GameshowExperience"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <p className="font-pixel text-sm text-green-400 animate-pulse">
          Loading...
        </p>
      </div>
    ),
  }
);

export default function Home() {
  return <GameshowExperience />;
}
