"use client";

import { useState } from "react";
import type { Track } from "@/lib/types";

type Props = {
  tracks: Track[];
};

export default function RecommendationList({ tracks }: Props) {
  if (!tracks.length) return null;

  return (
    <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {tracks.map((t) => (
        <li key={t.id} className="flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{t.title}</p>
            <p className="truncate text-xs text-zinc-500">{t.artist}</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span>{formatDuration(t.duration)}</span>
            <PlayButton />
          </div>
        </li>
      ))}
    </ul>
  );
}

function PlayButton() {
  const [playing, setPlaying] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setPlaying((p) => !p)}
      className={
        "rounded-full border px-3 py-1 text-xs transition " +
        (playing
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-zinc-200 bg-transparent text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800")
      }
    >
      {playing ? "暂停" : "播放"}
    </button>
  );
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
