"use client";

import { useEffect, useState } from "react";
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

  // 与全局播放器状态同步：当用户在全局条点击播放/暂停时，这里也更新图标状态
  useEffect(() => {
    const onState = (e: Event) => {
      const ce = e as CustomEvent<{ trackId: string; playing: boolean }>;
      const detail = ce.detail;
      if (!detail) return;
      if (current === detail.trackId) {
        setPlaying(detail.playing);
        return;
      }
      // 若全局播放的是本列表中的歌曲，则同步当前行与状态
      const exists = tracks.some((t) => t.id === detail.trackId);
      if (exists) {
        setCurrent(detail.trackId);
        setPlaying(detail.playing);
      } else if (detail.playing) {
        // 其他来源开始播放非本列表歌曲，取消本列表的播放高亮
        setPlaying(false);
      }
    };
    window.addEventListener("globalplayerstate" as any, onState as any);
    return () => window.removeEventListener("globalplayerstate" as any, onState as any);
  }, [current, tracks]);

  const handleToggle = (t: Track, idx: number) => {
    const url = urlForTrack(t, idx);
    const willPlay = !(current === t.id && playing);
    // 分发全局播放事件，由全局播放器处理音频逻辑
    try {
      window.dispatchEvent(
        new CustomEvent("globalplay", {
          detail: { track: t, url, command: willPlay ? "play" : "pause" },
        })
      );
    } catch {}
    setCurrent(t.id);
    setPlaying(willPlay);
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
                "inline-flex h-8 w-8 items-center justify-center rounded-full text-white " +
                (current === t.id && playing
                  ? "bg-brand-700 hover:bg-brand-800"
                  : "bg-brand-700 hover:bg-brand-800")
              }
              aria-label={current === t.id && playing ? "暂停" : "播放"}
              title={current === t.id && playing ? "暂停" : "播放"}
            >
              {current === t.id && playing ? (
                // pause icon
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h.5A1.75 1.75 0 0 1 10 4.75v14.5A1.75 1.75 0 0 1 8.25 21h-.5A1.75 1.75 0 0 1 6 19.25V4.75Zm8 0A1.75 1.75 0 0 1 15.75 3h.5A1.75 1.75 0 0 1 18 4.75v14.5A1.75 1.75 0 0 1 16.25 21h-.5A1.75 1.75 0 0 1 14 19.25V4.75Z" />
                </svg>
              ) : (
                // play icon
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M8 5.14v13.72c0 .79.86 1.27 1.54.84l10.38-6.86a1 1 0 0 0 0-1.68L9.54 4.3C8.86 3.87 8 4.35 8 5.14Z" />
                </svg>
              )}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
