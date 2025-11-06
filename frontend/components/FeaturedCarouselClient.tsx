"use client";

import { useMemo } from "react";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import type { Diary } from "@/lib/types";

export default function FeaturedCarouselClient({ diaries }: { diaries: (Diary & { isFavorite?: boolean })[] }) {
  const items = useMemo(() => {
    const selected = diaries.filter((d) => d.isFavorite);
    return selected.length ? selected : diaries.slice(0, 5);
  }, [diaries]);

  if (!items.length) return null;
  return <FeaturedCarousel items={items} />;
}
