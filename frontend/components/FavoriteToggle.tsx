"use client";

import { useState } from "react";

export default function FavoriteToggle({ diaryId, initial }: { diaryId: string; initial?: boolean }) {
  const [fav, setFav] = useState(Boolean(initial));

  const toggle = async () => {
    try {
      const res = await fetch(`/api/diaries/${encodeURIComponent(diaryId)}/favorite`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !fav }),
      });
      if (res.ok) {
        setFav((v) => !v);
      }
    } catch {}
  };

  return (
    <button
      type="button"
      aria-pressed={fav}
      onClick={toggle}
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
