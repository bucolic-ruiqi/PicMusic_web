"use client";

import type { Diary } from "@/lib/types";
import Link from "next/link";
import { buildDiaryHref } from "@/lib/config";

type Props = {
  diary: Diary;
  onClick?: (d: Diary) => void;
};

export default function DiaryCard({ diary, onClick }: Props) {
  const images = diary.photos.slice(0, 3);
  const fmtRange = (d: Diary) => {
    const end = new Date(d.endDate ?? d.date);
    const start = new Date(d.startDate ?? end.getTime() - 2 * 24 * 60 * 60 * 1000);
    const pad = (n: number) => n.toString().padStart(2, "0");
    if (start.getFullYear() === end.getFullYear()) {
      return `${end.getFullYear()}.${start.getMonth() + 1}.${pad(start.getDate())} – ${end.getMonth() + 1}.${pad(end.getDate())}`;
    }
    const s = `${start.getFullYear()}.${start.getMonth() + 1}.${pad(start.getDate())}`;
    const e = `${end.getFullYear()}.${end.getMonth() + 1}.${pad(end.getDate())}`;
    return `${s} – ${e}`;
  };

  const CardInner = (
    <article className="relative aspect-[4/3] overflow-hidden">
      {/* Container uses single column with proper spacing */}
      <div className="flex h-full flex-col p-2">
        {/* Header: title only（去心情标记） */}
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-semibold leading-tight text-zinc-800 dark:text-zinc-100">
            {diary.location}
          </h3>
        </div>

        {/* Text content - scrollable */}
        <div className="mb-2 flex-1 overflow-auto pr-1">
          <p className="text-[12px] leading-relaxed text-zinc-700 dark:text-zinc-300">
            {diary.text}
          </p>
        </div>

  {/* Images - compact row at bottom */}
        <div className="mb-2 flex gap-1.5">
          {images.length === 0 ? (
            <div className="flex h-14 w-full items-center justify-center rounded-[6px] bg-zinc-100 text-[10px] text-zinc-400 dark:bg-zinc-800">
              无图片
            </div>
          ) : (
            images.map((src, idx) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={idx}
                src={src}
                alt={`${diary.location} ${idx + 1}`}
                className="h-14 w-14 shrink-0 rounded-[6px] object-cover"
              />
            ))
          )}
        </div>

        {/* 首页不展示歌曲列表，保持卡片简洁 */}

        {/* Footer: date range only */}
        {/* Footer: date range + 详情提示 */}
        <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-500">
          <time dateTime={diary.startDate ?? diary.date}>{fmtRange(diary)}</time>
          <span className="rounded-full bg-brand-700 px-2.5 py-1 text-[10px] font-medium text-white transition-colors group-hover:bg-brand-800">
            查看
          </span>
        </div>
      </div>
    </article>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(diary)}
        className="group block w-full text-left"
      >
        {CardInner}
      </button>
    );
  }

  return (
    <Link href={buildDiaryHref(diary.id)} className="group block">
      {CardInner}
    </Link>
  );
}
