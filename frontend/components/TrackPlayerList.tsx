"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Track } from "@/lib/types";

const SAMPLE_URLS = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
];

function urlForTrack(t: Track, idx: number) {
  // 演示用途：使用公共示例音频，按索引轮循
  return SAMPLE_URLS[idx % SAMPLE_URLS.length];
}

export default function TrackPlayerList({ tracks }: { tracks: Track[] }) {
  const [current, setCurrent] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const a = (audioRef.current ??= new Audio());
    const onEnded = () => {
      setPlaying(false);
    };
    a.addEventListener("ended", onEnded);
    return () => a.removeEventListener("ended", onEnded);
  }, []);

  const handleToggle = (t: Track, idx: number) => {
    const a = (audioRef.current ??= new Audio());
    const url = urlForTrack(t, idx);
    if (current === t.id && !a.paused) {
      a.pause();
      setPlaying(false);
      return;
    }
    if (current !== t.id) {
      a.src = url;
      setCurrent(t.id);
    }
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };

  return (
    <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 text-sm dark:divide-zinc-800 dark:border-zinc-800">
      {tracks.map((t, idx) => (
        <li key={t.id} className="flex items-center justify-between p-3">
          <div className="min-w-0">
            <div className="truncate font-medium text-zinc-900 dark:text-zinc-100">{t.title}</div>
            <div className="truncate text-zinc-500 dark:text-zinc-400">{t.artist}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="shrink-0 tabular-nums text-xs text-zinc-500 dark:text-zinc-400">
              {Math.floor(t.duration / 60)}:{`${t.duration % 60}`.padStart(2, "0")}
            </div>
            <button
              type="button"
              onClick={() => handleToggle(t, idx)}
              className={
                "rounded-full px-3 py-1 text-xs " +
                (current === t.id && playing
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-brand-700 text-white hover:bg-brand-800")
              }
            >
              {current === t.id && playing ? "暂停" : "播放"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
