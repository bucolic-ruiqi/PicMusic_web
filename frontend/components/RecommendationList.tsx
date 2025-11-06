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
      {tracks.map((t, idx) => (
        <li key={t.id} className="flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{t.title}</p>
            <p className="truncate text-xs text-zinc-500">{t.artist}</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span>{formatDuration(t.duration)}</span>
            <PlayButton track={t} index={idx} />
          </div>
        </li>
      ))}
    </ul>
  );
}

const SAMPLE_URLS = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
];

function urlForTrack(t: Track, idx: number) {
  return SAMPLE_URLS[idx % SAMPLE_URLS.length];
}

function PlayButton({ track, index }: { track: Track; index: number }) {
  const [playing, setPlaying] = useState(false);
  const onClick = () => {
    const url = urlForTrack(track, index);
    const willPlay = !playing;
    try {
      window.dispatchEvent(
        new CustomEvent("globalplay", {
          detail: { track, url, command: willPlay ? "play" : "pause" },
        })
      );
    } catch {}
    setPlaying(willPlay);
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex h-7 w-7 items-center justify-center rounded-full text-white " +
        (playing ? "bg-red-600 hover:bg-red-700" : "bg-brand-700 hover:bg-brand-800")
      }
      aria-label={playing ? "暂停" : "播放"}
      title={playing ? "暂停" : "播放"}
    >
      {playing ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
          <path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h.5A1.75 1.75 0 0 1 10 4.75v14.5A1.75 1.75 0 0 1 8.25 21h-.5A1.75 1.75 0 0 1 6 19.25V4.75Zm8 0A1.75 1.75 0 0 1 15.75 3h.5A1.75 1.75 0 0 1 18 4.75v14.5A1.75 1.75 0 0 1 16.25 21h-.5A1.75 1.75 0 0 1 14 19.25V4.75Z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
          <path d="M8 5.14v13.72c0 .79.86 1.27 1.54.84l10.38-6.86a1 1 0 0 0 0-1.68L9.54 4.3C8.86 3.87 8 4.35 8 5.14Z" />
        </svg>
      )}
    </button>
  );
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
