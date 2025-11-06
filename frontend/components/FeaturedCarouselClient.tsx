"use client";

import { useEffect, useMemo, useState } from "react";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import type { Diary } from "@/lib/types";

function readFavorites(): string[] {
  try {
    const raw = localStorage.getItem("favoriteDiaries");
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export default function FeaturedCarouselClient({ diaries }: { diaries: Diary[] }) {
  const [favIds, setFavIds] = useState<string[]>([]);

  useEffect(() => {
    const update = () => setFavIds(readFavorites());
    update();
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "favoriteDiaries") update();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const items = useMemo(() => {
    const fav = new Set(favIds);
    const selected = diaries.filter((d) => fav.has(d.id));
    return selected.length ? selected : diaries.slice(0, 5);
  }, [diaries, favIds]);

  if (!items.length) return null;
  return <FeaturedCarousel items={items} />;
}
