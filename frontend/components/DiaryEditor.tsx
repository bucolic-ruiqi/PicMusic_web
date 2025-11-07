"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Diary, DiaryFormValues, Mood, Track } from "@/lib/types";
import DiaryForm from "@/components/DiaryForm";
import MultiUploadArea from "@/components/MultiUploadArea";
import MoodBadge from "@/components/MoodBadge";
import FavoriteToggle from "@/components/FavoriteToggle";
import TrackPlayerList from "@/components/TrackPlayerList";

function fmtRangeISO(start?: string, end?: string, fallback?: string) {
  const endDate = end ? new Date(end) : fallback ? new Date(fallback) : new Date();
  const startDate = start ? new Date(start) : new Date(endDate.getTime() - 2 * 24 * 3600 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  const sameMonth = sameYear && startDate.getMonth() === endDate.getMonth();

  if (sameYear && sameMonth) {
    // 同年同月：2025.10.15 – 18
    return `${endDate.getFullYear()}.${endDate.getMonth() + 1}.${pad(startDate.getDate())} – ${pad(endDate.getDate())}`;
  }
  if (sameYear) {
    // 同年不同月：2025.10.15 – 11.02
    return `${endDate.getFullYear()}.${startDate.getMonth() + 1}.${pad(startDate.getDate())} – ${endDate.getMonth() + 1}.${pad(endDate.getDate())}`;
  }
  // 不同年：2024.12.31 – 2025.01.02
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
  const router = useRouter();
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
  // 全局编辑开关
  const [editing, setEditing] = useState<boolean>(false);
  const [confirmingDelete, setConfirmingDelete] = useState<boolean>(false);

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
    // 保护：若 id 非数字，阻止保存并提示
    if (!Number.isFinite(Number(initial.id))) {
      console.error("Invalid diary id, cannot save:", initial.id);
      alert("当前日记 ID 非法，无法保存到数据库。请返回首页重新进入或选择其它日记。");
      return;
    }
    setSaving(true);
    try {
      const putRes = await fetch(`/api/diaries/${encodeURIComponent(initial.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          mood,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          text,
          photos,
          trackIds: tracks
            .map((t) => String(t.id))
            .filter((s) => /^\d+$/.test(s)),
        }),
      });
      if (!putRes.ok) {
        let msg = "保存失败";
        try {
          const err = await putRes.json();
          msg = err?.error || msg;
        } catch {}
        alert(msg);
        return;
      }
      // 保存后拉取最新数据，确保与数据库一致
      const r = await fetch(`/api/diaries/${encodeURIComponent(initial.id)}`);
      if (r.ok) {
        const updated: Diary = await r.json();
        setLocation(updated.location);
        setMood(updated.mood as Mood);
        setStartDate((updated.startDate ?? updated.date).slice(0, 10));
        setEndDate((updated.endDate ?? updated.date).slice(0, 10));
        setText(updated.text);
        setPhotos(updated.photos ?? []);
        setTracks(updated.tracks ?? []);
      }
      setSaved(true);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const deleteDiary = async () => {
    if (!Number.isFinite(Number(initial.id))) {
      alert("当前日记 ID 非法，无法删除。");
      return;
    }
    await fetch(`/api/diaries/${encodeURIComponent(initial.id)}`, { method: "DELETE" });
    router.replace("/");
  };

  const diaryFormInitial: DiaryFormValues = useMemo(
    () => ({ location, mood, startDate, endDate, text }),
    [location, mood, startDate, endDate, text]
  );

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-4 sm:px-8">
      {/* 头部概览：强调展示 */}
      <div className="mb-6">
        {/* 先显示地点主标题 */}
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{location}</h1>
        {/* 再显示日期/心情/数量 + 右侧收藏/编辑/删除 */}
        <div className="mt-2 flex items-start justify-between gap-3">
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
          <div className="relative flex items-center gap-2">
            <FavoriteToggle diaryId={initial.id} initial={(initial as any).isFavorite} />
            {/* 全局编辑按钮（与收藏大小一致，含图标） */}
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className={
                "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ring-1 transition " +
                (editing
                  ? "bg-brand-700 text-white ring-brand-600 hover:bg-brand-800"
                  : "bg-white text-brand-700 ring-brand-200 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-brand-300 dark:ring-brand-900/50 dark:hover:bg-zinc-800")
              }
              aria-pressed={editing}
              title={editing ? "退出编辑" : "编辑"}
            >
              {/* pencil icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={"h-3.5 w-3.5 " + (editing ? "text-white" : "text-brand-700 dark:text-brand-300") }>
                <path d="M20.71 5.63 18.37 3.3a1 1 0 0 0-1.41 0L6 14.25V18h3.75l10.95-10.95a1 1 0 0 0 0-1.41ZM8.92 16H8v-.92l8.95-8.95.92.92L8.92 16Z" />
              </svg>
              {editing ? "退出" : "编辑"}
            </button>
            {/* 删除按钮（与收藏大小一致，含图标） */}
            <button
              type="button"
              onClick={() => setConfirmingDelete((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs text-red-600 ring-1 ring-red-300 hover:bg-red-50 dark:bg-zinc-900 dark:text-red-400 dark:ring-red-800"
              title="删除"
            >
              {/* trash icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M9 3a1 1 0 0 0-1 1v1H4a1 1 0 1 0 0 2h.68l1.12 12.06A3 3 0 0 0 8.78 22h6.44a3 3 0 0 0 2.98-2.94L19.32 7H20a1 1 0 1 0 0-2h-4V4a1 1 0 0 0-1-1H9Zm2 4a1 1 0 1 1 2 0v9a1 1 0 1 1-2 0V7Zm-3 0a1 1 0 1 1 2 0v9a1 1 0 1 1-2 0V7Zm8 0a1 1 0 1 1 2 0v9a1 1 0 1 1-2 0V7Z" />
              </svg>
              删除
            </button>

            {confirmingDelete && (
              <div className="absolute right-0 top-10 z-40 w-56 rounded-lg border border-zinc-200 bg-white p-3 text-sm shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                <p className="mb-3 text-zinc-700 dark:text-zinc-300">确定删除这段旅途回忆吗？此操作不可撤销。</p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    className="rounded-md border border-zinc-300 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={deleteDiary}
                    className="rounded-md bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
                  >
                    确认删除
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 照片区域：默认展示画廊，进入编辑后显示上传器 */}
      <section className="mt-2">
        <div className="mb-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">旅途照片</h2>
        </div>
        {!editing ? (
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
        <div className="mb-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">旅行札记</h2>
        </div>
        {!editing ? (
          <div
            className="prose prose-zinc max-w-none text-[15px] leading-8 dark:prose-invert prose-p:text-zinc-900 dark:prose-p:text-zinc-100"
            dangerouslySetInnerHTML={{ __html: mdToHtml(text) }}
          />
        ) : (
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <DiaryForm
              onSubmit={onSubmitForm}
              initial={diaryFormInitial}
              onChange={(v) => {
                setLocation(v.location);
                setMood(v.mood);
                setStartDate(v.startDate);
                setEndDate(v.endDate);
                setText(v.text);
                setSaved(false);
              }}
              key={`${initial.id}`}
            />
          </div>
        )}
      </section>

      {/* 推荐歌单：默认展示已选择；进入编辑仅显示已选（不再提供前端推荐逻辑） */}
      <section className="mt-10">
        <div className="mb-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">推荐歌单</h2>
        </div>

        {!editing ? (
          tracks.length ? (
            <TrackPlayerList tracks={tracks} />
          ) : (
            <p className="text-sm text-zinc-500">还没有选择歌曲</p>
          )
        ) : (
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
        )}
      </section>

      {/* 保存提示与按钮：仅在发生修改后强调 */}
      {!saved && (
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <button
            onClick={saveAll}
            disabled={saving}
            className={"rounded-full px-6 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 " + (saving ? "cursor-wait bg-zinc-300 text-zinc-600" : "bg-brand-700 text-white hover:bg-brand-800 focus:ring-brand-500/40")}
          >
            {saving ? "保存中..." : "保存修改"}
          </button>
          <span className="text-sm text-orange-600 dark:text-orange-400">有未保存的更改</span>
        </div>
      )}
    </div>
  );
}
