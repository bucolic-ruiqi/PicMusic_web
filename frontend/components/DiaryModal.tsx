"use client";

import type { Diary } from "@/lib/types";
import { useEffect } from "react";

function fmtRange(d: Diary) {
  const end = new Date(d.endDate ?? d.date);
  const start = new Date(d.startDate ?? end.getTime() - 2 * 24 * 60 * 60 * 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (start.getFullYear() === end.getFullYear()) {
    return `${end.getFullYear()}.${start.getMonth() + 1}.${pad(start.getDate())} – ${end.getMonth() + 1}.${pad(end.getDate())}`;
  }
  const s = `${start.getFullYear()}.${start.getMonth() + 1}.${pad(start.getDate())}`;
  const e = `${end.getFullYear()}.${end.getMonth() + 1}.${pad(end.getDate())}`;
  return `${s} – ${e}`;
}

export default function DiaryModal({ diary, onClose }: { diary: Diary | null; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!diary) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-xl bg-white shadow-2xl dark:bg-zinc-900">
          {/* header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200/80 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-900">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{diary.location}</h2>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                <time dateTime={diary.startDate ?? diary.date}>{fmtRange(diary)}</time>
              </div>
            </div>
            <button
              className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              onClick={onClose}
            >
              关闭
            </button>
          </div>

          {/* body */}
          <div className="p-4">
            {diary.photos.length > 0 && (
              <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {diary.photos.map((src, idx) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={idx} src={src} alt={`${diary.location} ${idx + 1}`} className="h-52 w-full rounded-md object-cover sm:h-64" />
                ))}
              </div>
            )}

            <p className="max-w-3xl text-sm leading-7 text-zinc-800 dark:text-zinc-200">{diary.text}</p>

            {diary.tracks && diary.tracks.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">关联音乐</h3>
                <ul className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
                  {diary.tracks.map((t) => (
                    <li key={t.id} className="flex items-center justify-between py-3">
                      <div className="min-w-0">
                        <div className="truncate font-medium text-zinc-900 dark:text-zinc-100">{t.title}</div>
                        <div className="truncate text-zinc-500 dark:text-zinc-400">{t.artist}</div>
                      </div>
                      <div className="shrink-0 tabular-nums text-zinc-500 dark:text-zinc-400">
                        {Math.floor(t.duration / 60)}:{`${t.duration % 60}`.padStart(2, "0")}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
