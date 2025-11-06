"use client";

import { useEffect, useRef, useState } from "react";
import type { Track } from "@/lib/types";

export default function GlobalAudioBar() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [src, setSrc] = useState<string>("");
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const a = (audioRef.current ??= new Audio());
    const onTime = () => setProgress(a.currentTime || 0);
    const onLoaded = () => setDuration(a.duration || 0);
    const onEnded = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("ended", onEnded);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("ended", onEnded);
    };
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ track: Track; url: string; command?: "play" | "pause" | "toggle" }>;
      const detail = ce.detail;
      if (!detail) return;
      const a = (audioRef.current ??= new Audio());
      const isSame = track?.id === detail.track.id;
      const command = detail.command || "toggle";
      if (!isSame) {
        setTrack(detail.track);
        setSrc(detail.url);
        a.src = detail.url;
      }
      if (command === "pause" || (isSame && !a.paused)) {
        a.pause();
        setPlaying(false);
      } else {
        a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      }
    };
    window.addEventListener("globalplay" as any, handler as any);
    return () => window.removeEventListener("globalplay" as any, handler as any);
  }, [track]);

  const mmss = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.max(0, Math.floor(s % 60));
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const a = audioRef.current;
    if (!a) return;
    const v = Number(e.target.value);
    a.currentTime = v;
    setProgress(v);
  };

  const onSeekBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !duration || duration <= 0) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const sec = ratio * duration;
    a.currentTime = sec;
    setProgress(sec);
  };

  return (
    <div
      className="fixed bottom-6 right-24 z-50 max-w-[70vw] overflow-hidden rounded-full border border-white/40 bg-white/50 px-3 py-2 shadow-2xl ring-1 ring-white/40 backdrop-blur-md backdrop-saturate-125 supports-[backdrop-filter]:bg-white/30 dark:border-white/10 dark:bg-zinc-900/50 dark:ring-white/5 dark:supports-[backdrop-filter]:bg-zinc-900/30 sm:bottom-8 sm:right-28"
      role="region"
      aria-label="全局播放器"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            const a = audioRef.current;
            if (!a) return;
            if (!src) return; // 尚未选择歌曲
            if (a.paused) a.play().then(() => setPlaying(true));
            else a.pause(), setPlaying(false);
          }}
          className={
            "inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition " +
            (!src
              ? "bg-zinc-300 cursor-not-allowed"
              : playing
                ? "bg-red-600 hover:bg-red-700"
                : "bg-brand-700 hover:bg-brand-800")
          }
          aria-label={!src ? "未选择歌曲" : playing ? "暂停" : "播放"}
          title={!src ? "未选择歌曲" : playing ? "暂停" : "播放"}
          disabled={!src}
        >
          {playing ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h.5A1.75 1.75 0 0 1 10 4.75v14.5A1.75 1.75 0 0 1 8.25 21h-.5A1.75 1.75 0 0 1 6 19.25V4.75Zm8 0A1.75 1.75 0 0 1 15.75 3h.5A1.75 1.75 0 0 1 18 4.75v14.5A1.75 1.75 0 0 1 16.25 21h-.5A1.75 1.75 0 0 1 14 19.25V4.75Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M8 5.14v13.72c0 .79.86 1.27 1.54.84l10.38-6.86a1 1 0 0 0 0-1.68L9.54 4.3C8.86 3.87 8 4.35 8 5.14Z" />
            </svg>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{track?.title ?? "未选择歌曲"}</div>
          <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">{track?.artist ?? "选择任意列表中的播放键开始"}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">{mmss(progress)}</span>
          {/* 自定义进度条：与按钮同高，内部轨道居中 */}
          <div
            className={
              "relative h-10 w-36 cursor-pointer rounded-full sm:w-52 " +
              (!src ? "cursor-not-allowed opacity-60" : "")
            }
            onClick={(e) => src && onSeekBarClick(e)}
            role="slider"
            aria-valuemin={0}
            aria-valuemax={Number.isFinite(duration) && duration > 0 ? Math.floor(duration) : 0}
            aria-valuenow={Math.floor(progress)}
            aria-label="进度"
          >
            {/* 轨道 */}
            <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            {/* 已播放 */}
            <div
              className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-brand-700"
              style={{ width: `${duration > 0 ? Math.min(100, (progress / duration) * 100) : 0}%` }}
            />
            {/* 拖动柄（视觉） */}
            <div
              className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-white bg-brand-700 shadow"
              style={{ left: `calc(${duration > 0 ? Math.min(100, (progress / duration) * 100) : 0}% - 6px)` }}
            />
          </div>
          <span className="text:[11px] tabular-nums text-zinc-500 dark:text-zinc-400">{mmss(duration)}</span>
        </div>
      </div>
    </div>
  );
}
