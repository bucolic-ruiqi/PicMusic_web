"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import type { Diary, Track } from "@/lib/types";

function extractDiaryId(next: string | null): string | null {
  if (!next) return null;
  const m = next.match(/\/diary\/([^?/#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export default function RecommendSelectPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const diaryId = extractDiaryId(next);

  const [diary, setDiary] = useState<Diary | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);

  // 拉取日记（优先使用 next 中的 id；若无则取首条）
  useEffect(() => {
    let aborted = false;
    async function loadDiary() {
      try {
        if (diaryId) {
          const res = await fetch(`/api/diaries/${encodeURIComponent(diaryId)}`, { cache: "no-store" });
          if (res.ok) {
            const json = await res.json();
            if (!aborted && json) setDiary(json as Diary);
          } else {
            // 兜底：取首条
            const res2 = await fetch(`/api/diaries`, { cache: "no-store" });
            const json2 = await res2.json();
            if (Array.isArray(json2) && json2.length) setDiary(json2[0] as Diary);
          }
        } else {
          const res = await fetch(`/api/diaries`, { cache: "no-store" });
          const json = await res.json();
          if (!aborted && Array.isArray(json) && json.length) setDiary(json[0] as Diary);
        }
      } catch {}
    }
    loadDiary();
    return () => {
      aborted = true;
    };
  }, [diaryId]);

  // 从 loading 阶段缓存的推荐结果读取数据
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("newDiary:recommendItems") : null;
      if (raw) {
        const items = JSON.parse(raw) as Array<{ id: string | number; name: string; artist: string }>;
        const mapped: Track[] = (Array.isArray(items) ? items : []).map((it) => ({
          id: String((it as any).id ?? ""),
          title: it.name,
          artist: it.artist,
          duration: 180,
        })).filter((t) => /^\d+$/.test(t.id));
        setTracks(mapped);
        // 默认全选，避免用户忘记选择导致不写入
        setSelected(new Set(mapped.map((t) => t.id)));
      } else {
        setTracks([]);
      }
    } catch {
      setTracks([]);
    }
  }, []);

  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [current, setCurrent] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const SAMPLE_URLS = [
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
  ];
  const urlForTrack = (idx: number) => SAMPLE_URLS[idx % SAMPLE_URLS.length];

  const handleTogglePlay = (t: { id: string }, idx: number) => {
    const willPlay = !(current === t.id && playing);
    try {
      window.dispatchEvent(
        new CustomEvent("globalplay", {
          detail: { track: t, url: urlForTrack(idx), command: willPlay ? "play" : "pause" },
        })
      );
    } catch {}
    setCurrent(t.id);
    setPlaying(willPlay);
  };

  const handleConfirm = () => {
    // 持久化本次选择，方便后续在详情页读取（可选使用，不影响跳转）
    try {
      const key = `selectedTracks:${diary?.id ?? "unknown"}`;
      const chosen = tracks.filter((t) => selected.has(t.id));
      localStorage.setItem(key, JSON.stringify(chosen));
      // 清理临时图片数据
      localStorage.removeItem("newDiary:imageDataUrl");
      localStorage.removeItem("newDiary:recommendItems");
    } catch {}
    // 将所选歌曲写回当前日记（track_ids_json）
    (async () => {
      try {
        if (diary?.id) {
          const ids = tracks
            .filter((t) => selected.has(t.id))
            .map((t) => t.id)
            .filter((s) => /^\d+$/.test(s));
          if (ids.length) {
            await fetch(`/api/diaries/${encodeURIComponent(diary.id)}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ trackIds: ids }),
            });
          }
        }
      } catch {}
    })();
    // 标记来源，进入日记详情
    const url = next.includes("?") ? `${next}&from=new` : `${next}?from=new`;
    router.replace(url);
  };

  return (
    <div>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-100">为你挑选的歌曲</h1>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-300">
          我们基于你的旅途心情为你生成了一些歌曲，你可以先听一听。若喜欢本次旅途，也可直接加入首页轮播。
        </p>
        {/* 歌曲试听 + 点❤️选择加入 */}
        <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 text-sm dark:divide-zinc-800 dark:border-zinc-800">
          {tracks.map((t, idx) => {
            const isSelected = selected.has(t.id);
            const isPlaying = current === t.id && playing;
            return (
              <li key={t.id} className="flex items-center justify-between p-3">
                <div className="min-w-0">
                  <div className="truncate font-medium text-zinc-900 dark:text-zinc-100">{t.title}</div>
                  <div className="truncate text-zinc-500 dark:text-zinc-400">{t.artist}</div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="shrink-0 tabular-nums text-xs text-zinc-500 dark:text-zinc-400">
                    {Math.floor(t.duration / 60)}:{`${t.duration % 60}`.padStart(2, "0")}
                  </div>
                  {/* 播放按钮（图标） */}
                  <button
                    type="button"
                    onClick={() => handleTogglePlay(t, idx)}
                    className={
                      "inline-flex h-8 w-8 items-center justify-center rounded-full text-white " +
                      (isPlaying ? "bg-brand-700 hover:bg-brand-800" : "bg-brand-700 hover:bg-brand-800")
                    }
                    aria-label={isPlaying ? "暂停" : "播放"}
                    title={isPlaying ? "暂停" : "播放"}
                  >
                    {isPlaying ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                        <path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h.5A1.75 1.75 0 0 1 10 4.75v14.5A1.75 1.75 0 0 1 8.25 21h-.5A1.75 1.75 0 0 1 6 19.25V4.75Zm8 0A1.75 1.75 0 0 1 15.75 3h.5A1.75 1.75 0 0 1 18 4.75v14.5A1.75 1.75 0 0 1 16.25 21h-.5A1.75 1.75 0 0 1 14 19.25V4.75Z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                        <path d="M8 5.14v13.72c0 .79.86 1.27 1.54.84l10.38-6.86a1 1 0 0 0 0-1.68L9.54 4.3C8.86 3.87 8 4.35 8 5.14Z" />
                      </svg>
                    )}
                  </button>
                  {/* 选择加入（爱心） */}
                  <button
                    type="button"
                    onClick={() => toggleSelect(t.id)}
                    className={
                      "inline-flex h-8 w-8 items-center justify-center rounded-full border " +
                      (isSelected
                        ? "border-pink-600 bg-pink-600 text-white hover:bg-pink-700"
                        : "border-zinc-300 bg-white text-pink-600 hover:bg-pink-50 dark:border-zinc-700 dark:bg-zinc-900")
                    }
                    aria-label={isSelected ? "已选择" : "选择加入"}
                    title={isSelected ? "已选择" : "选择加入"}
                  >
                    {isSelected ? (
                      // 实心爱心
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                        <path d="M12 21s-6.716-4.267-9.193-7.22C1.1 11.86 1.29 8.9 3.343 7.1A5.01 5.01 0 0 1 6.7 6c1.37 0 2.735.53 3.738 1.59L12 9.22l1.562-1.63C14.565 6.531 15.93 6 17.3 6c1.304 0 2.607.45 3.657 1.35 2.053 1.8 2.243 4.76.536 6.68C18.716 16.733 12 21 12 21z" />
                      </svg>
                    ) : (
                      // 空心爱心
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                        <path fillRule="evenodd" d="M3.172 7.172a4 4 0 0 1 5.656 0L12 10.343l3.172-3.171a4 4 0 1 1 5.656 5.656L12 21.657 3.172 12.828a4 4 0 0 1 0-5.656Zm1.414 1.414a2 2 0 0 0 0 2.828L12 18.828l7.414-7.414a2 2 0 1 0-2.828-2.828L12 13.172 7.414 8.586a2 2 0 0 0-2.828 0Z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex h-9 items-center justify-center rounded-md bg-brand-700 px-4 text-sm font-medium text-white hover:bg-brand-800"
          >
            确认并进入日记
          </button>
        </div>
      </main>
    </div>
  );
}
