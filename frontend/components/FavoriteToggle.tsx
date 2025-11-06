"use client";

import { useEffect, useState } from "react";

function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem("favoriteDiaries");
    if (!raw) return new Set();
    const arr: unknown = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? (arr as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveFavorites(set: Set<string>) {
  localStorage.setItem("favoriteDiaries", JSON.stringify(Array.from(set)));
  // 通知其它组件（如轮播客户端）
  window.dispatchEvent(new StorageEvent("storage", { key: "favoriteDiaries" }));
}

export default function FavoriteToggle({ diaryId }: { diaryId: string }) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(loadFavorites().has(diaryId));
  }, [diaryId]);

  return (
    <button
      type="button"
      aria-pressed={fav}
      onClick={() => {
        const s = loadFavorites();
        if (s.has(diaryId)) s.delete(diaryId); else s.add(diaryId);
        saveFavorites(s);
        setFav(s.has(diaryId));
      }}
      className={
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ring-1 transition " +
        (fav
          ? "bg-amber-400 text-white ring-amber-300 hover:bg-amber-500"
          : "bg-white text-zinc-600 ring-zinc-300 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800")
      }
      title={fav ? "已收藏，显示在轮播" : "收藏，加入轮播"}
    >
      <span className={fav ? "text-white" : "text-amber-500"}>★</span>
      {fav ? "已收藏" : "收藏"}
    </button>
  );
}
