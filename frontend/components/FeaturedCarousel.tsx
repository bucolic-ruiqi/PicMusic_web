"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Diary } from "@/lib/types";

type Props = {
  items: Diary[];
};

export default function FeaturedCarousel({ items }: Props) {
  const slides = useMemo(() => items.filter((d) => d.photos?.[0]), [items]);
  const [index, setIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // 稳定日期格式，避免 SSR/客户端时区差异导致的 hydration mismatch
  const fmtDate = useCallback((iso: string) => {
    try {
      return new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "UTC",
      }).format(new Date(iso));
    } catch {
      const d = new Date(iso);
      const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(d.getUTCDate()).padStart(2, "0");
      return `${d.getUTCFullYear()}/${mm}/${dd}`;
    }
  }, []);

  const scrollTo = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(i, slides.length - 1));
    const child = el.children[clamped] as HTMLElement | undefined;
    if (child) {
      child.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      setIndex(clamped);
    }
  };

  if (!slides.length) return null;

  return (
    <div
      className="group relative"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") scrollTo(index - 1);
        if (e.key === "ArrowRight") scrollTo(index + 1);
      }}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="精选回忆"
    >
      {/* 横向滚动区域：移动端为多卡片横滑，桌面为单张全宽 Hero */}
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto no-scrollbar lg:gap-0 lg:overflow-hidden"
      >
        {slides.map((d) => (
          <Link
            href={`/diary/${d.id}`}
            key={d.id}
            className="relative aspect-[16/9] w-[88%] shrink-0 snap-center overflow-hidden sm:w-[78%] md:w-[68%] lg:w-full lg:aspect-[16/6]"
          >
            <article className="relative h-full w-full">
              <Image
                src={d.photos[0]}
                alt={`${d.location} 封面`}
                fill
                priority={false}
                sizes="(max-width: 1024px) 80vw, 100vw"
                className="object-cover"
              />
              {/* 渐变信息层 */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 text-white">
                <div className="mx-auto max-w-7xl px-6 pb-5 text-right sm:px-8 lg:pb-6">
                  <div className="text-xs opacity-90">{fmtDate(d.date)}</div>
                  <h3 className="mt-1 line-clamp-1 text-xl font-semibold tracking-tight lg:text-2xl">{d.location}</h3>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* 左右控件（桌面常显，移动端隐藏） */}
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between px-2 lg:flex">
        <button
          aria-label="上一张"
          onClick={() => scrollTo(index - 1)}
          className="pointer-events-auto rounded-full bg-black/35 p-2 text-white backdrop-blur hover:bg-black/45"
        >
          ‹
        </button>
        <button
          aria-label="下一张"
          onClick={() => scrollTo(index + 1)}
          className="pointer-events-auto rounded-full bg-black/35 p-2 text-white backdrop-blur hover:bg-black/45"
        >
          ›
        </button>
      </div>

      {/* 指示点 */}
      <div className="mt-2 flex justify-center gap-1">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`跳转到第 ${i + 1} 张`}
            className={`h-1.5 w-4 rounded-full transition-colors ${i === index ? "bg-brand-700" : "bg-zinc-300 dark:bg-zinc-700"}`}
          />
        ))}
      </div>
    </div>
  );
}
