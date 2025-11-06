"use client";

import { useMemo, useState } from "react";
import type { Diary, DiaryFormValues, Mood, Track } from "@/lib/types";
import DiaryForm from "@/components/DiaryForm";
import MultiUploadArea from "@/components/MultiUploadArea";
import MoodBadge from "@/components/MoodBadge";
import FavoriteToggle from "@/components/FavoriteToggle";
import TrackPlayerList from "@/components/TrackPlayerList";
import { recommendTracks } from "../lib/recommend";

function fmtRangeISO(start?: string, end?: string, fallback?: string) {
  const endDate = end ? new Date(end) : fallback ? new Date(fallback) : new Date();
  const startDate = start ? new Date(start) : new Date(endDate.getTime() - 2 * 24 * 3600 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  if (startDate.getFullYear() === endDate.getFullYear()) {
    return `${endDate.getFullYear()}.${endDate.getMonth() + 1}.${pad(endDate.getDate())} – ${endDate.getMonth() + 1}.${pad(endDate.getDate())}`;
  }
  return `${startDate.getFullYear()}.${startDate.getMonth() + 1}.${pad(startDate.getDate())} – ${endDate.getFullYear()}.${endDate.getMonth() + 1}.${pad(endDate.getDate())}`;
}

function mdToHtml(src: string) {
  let s = src.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  s = s.replace(/^###\s+(.+)$/gm, "<h3 class='mt-2 mb-1 text-base font-semibold text-brand-800 dark:text-brand-200'>$1</h3>");
  s = s.replace(/^##\s+(.+)$/gm, "<h2 class='mt-2 mb-1 text-lg font-semibold text-brand-800 dark:text-brand-200'>$1</h2>");
  s = s.replace(/^#\s+(.+)$/gm, "<h1 class='mt-2 mb-1 text-xl font-semibold text-brand-800 dark:text-brand-200'>$1</h1>");
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
  s = s.replace(/`([^`]+?)`/g, "<code class='rounded bg-zinc-100 px-1 py-0.5 text-[12px] dark:bg-zinc-800'>$1</code>");
  s = s.replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, "<a class='text-brand-700 underline' href='$2' target='_blank' rel='noreferrer'>$1</a>");
  s = s.replace(/\n/g, "<br/>");
  return s;
}

export default function DiaryEditor({ initial }: { initial: Diary }) {
  // 状态：展示为主，按需进入编辑
  const [photos, setPhotos] = useState<string[]>(initial.photos ?? []);
  const [tracks, setTracks] = useState<Track[]>(initial.tracks ?? []);
  const [mood, setMood] = useState<Mood>(initial.mood);
  const [location, setLocation] = useState<string>(initial.location);
  const [text, setText] = useState<string>(initial.text);
  const [startDate, setStartDate] = useState<string>((initial.startDate ?? initial.date).slice(0, 10));
  const [endDate, setEndDate] = useState<string>((initial.endDate ?? initial.date).slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<boolean>(true);

  // 编辑开关
  const [editContent, setEditContent] = useState<boolean>(false);
  const [editPhotos, setEditPhotos] = useState<boolean>(false);
  const [editTracks, setEditTracks] = useState<boolean>(false);

  const recs: Track[] = useMemo(() => recommendTracks(mood), [mood]);
  const selectedIds = useMemo(() => new Set(tracks.map((t) => t.id)), [tracks]);

  const onSelectPhotos = (_files: File[], urls: string[]) => {
    setPhotos((prev) => [...prev, ...urls]);
    setSaved(false);
  };

  const onRemovePhoto = (i: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
    setSaved(false);
  };

  const onSubmitForm = (v: DiaryFormValues) => {
    setLocation(v.location);
    setMood(v.mood);
    setStartDate(v.startDate);
    setEndDate(v.endDate);
    setText(v.text);
    setSaved(false);
    setEditContent(false);
  };

  const addTrack = (t: Track) => {
    if (selectedIds.has(t.id)) return;
    setTracks((prev) => [...prev, t]);
    setSaved(false);
  };
  const removeTrack = (id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
    setSaved(false);
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const updated: Diary = {
        ...initial,
        location,
        mood,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        text,
        photos,
        tracks,
      };
      localStorage.setItem(`diary:${initial.id}`, JSON.stringify(updated));
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const diaryFormInitial: DiaryFormValues = useMemo(
    () => ({ location, mood, startDate, endDate, text }),
    [location, mood, startDate, endDate, text]
  );

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-4 sm:px-8">
      {/* 头部概览：强调展示 */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
            <time dateTime={initial.startDate ?? initial.date}>{fmtRangeISO(initial.startDate, initial.endDate, initial.date)}</time>
            <span>·</span>
            <MoodBadge mood={mood} />
            <span>·</span>
            <span>{photos.length} 张照片</span>
            {tracks.length > 0 && (
              <>
                <span>·</span>
                <span>{tracks.length} 首音乐</span>
              </>
            )}
          </div>
          <FavoriteToggle diaryId={initial.id} />
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{location}</h1>
      </div>

      {/* 照片区域：默认展示画廊，进入编辑后显示上传器 */}
      <section className="mt-2">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">旅途照片</h2>
          <button
            type="button"
            onClick={() => setEditPhotos((v) => !v)}
            className="rounded-full px-3 py-1 text-xs text-zinc-600 ring-1 ring-zinc-300 hover:bg-zinc-100 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800"
          >
            {editPhotos ? "完成" : "管理照片"}
          </button>
        </div>
        {!editPhotos ? (
          photos.length ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((src, idx) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={idx} src={src} alt={`${location} ${idx + 1}`} className="h-64 w-full rounded-md object-cover sm:h-72 lg:h-64" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">暂无照片</p>
          )
        ) : (
          <div className="rounded-lg border border-dashed border-brand-300/80 p-4 dark:border-brand-900/40">
            <MultiUploadArea previews={photos} onSelected={onSelectPhotos} onRemove={onRemovePhoto} />
          </div>
        )}
      </section>

      {/* 札记：默认展示 Markdown 渲染，进入编辑用 DiaryForm */}
      <section className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">旅行札记</h2>
          <button
            type="button"
            onClick={() => setEditContent((v) => !v)}
            className="rounded-full px-3 py-1 text-xs text-zinc-600 ring-1 ring-zinc-300 hover:bg-zinc-100 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800"
          >
            {editContent ? "完成" : "编辑内容"}
          </button>
        </div>
        {!editContent ? (
          <div
            className="prose prose-zinc max-w-none text-[15px] leading-8 dark:prose-invert prose-p:text-zinc-900 dark:prose-p:text-zinc-100"
            dangerouslySetInnerHTML={{ __html: mdToHtml(text) }}
          />
        ) : (
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <DiaryForm onSubmit={onSubmitForm} key={`${location}|${mood}|${startDate}|${endDate}`} />
          </div>
        )}
      </section>

      {/* 推荐歌单：默认展示已选择；进入编辑显示推荐 + 已选，可添加/移除 */}
      <section className="mt-10">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">推荐歌单</h2>
          <button
            type="button"
            onClick={() => setEditTracks((v) => !v)}
            className="rounded-full px-3 py-1 text-xs text-zinc-600 ring-1 ring-zinc-300 hover:bg-zinc-100 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800"
          >
            {editTracks ? "完成" : "编辑歌单"}
          </button>
        </div>

        {!editTracks ? (
          tracks.length ? (
            <TrackPlayerList tracks={tracks} />
          ) : (
            <p className="text-sm text-zinc-500">还没有选择歌曲</p>
          )
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <h3 className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">根据心情「{mood}」推荐</h3>
              {recs.length ? (
                <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {recs.map((t) => (
                    <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                      <div className="min-w-0">
                        <div className="truncate font-medium text-zinc-900 dark:text-zinc-100">{t.title}</div>
                        <div className="truncate text-zinc-500 dark:text-zinc-400">{t.artist}</div>
                      </div>
                      <button
                        type="button"
                        disabled={selectedIds.has(t.id)}
                        onClick={() => addTrack(t)}
                        className={"rounded-full px-3 py-1 text-xs " + (selectedIds.has(t.id) ? "cursor-not-allowed bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400" : "bg-brand-700 text-white hover:bg-brand-800")}
                      >
                        {selectedIds.has(t.id) ? "已添加" : "添加"}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500">暂无推荐</p>
              )}
            </div>

            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <h3 className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">已选择歌单</h3>
              {tracks.length ? (
                <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {tracks.map((t) => (
                    <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                      <div className="min-w-0">
                        <div className="truncate font-medium text-zinc-900 dark:text-zinc-100">{t.title}</div>
                        <div className="truncate text-zinc-500 dark:text-zinc-400">{t.artist}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTrack(t.id)}
                        className="rounded-full bg-zinc-200 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
                      >
                        移除
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500">还没有选择歌曲</p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 保存提示与按钮：仅在发生修改后强调 */}
      <div className="mt-10 flex flex-wrap items-center gap-3">
        {!saved && (
          <button
            onClick={saveAll}
            disabled={saving}
            className={"rounded-full px-6 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 " + (saving ? "cursor-wait bg-zinc-300 text-zinc-600" : "bg-brand-700 text-white hover:bg-brand-800 focus:ring-brand-500/40")}
          >
            {saving ? "保存中..." : "保存修改（本地预览）"}
          </button>
        )}
        {saved ? (
          <span className="text-sm text-zinc-500">已保存</span>
        ) : (
          <span className="text-sm text-orange-600 dark:text-orange-400">有未保存的更改</span>
        )}
      </div>
    </div>
  );
}
