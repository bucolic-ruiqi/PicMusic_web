"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BACKEND_BASE_URL } from "@/lib/config";

export default function LoadingRecommendationPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const diaryId = (() => {
    const m = next.match(/\/diary\/([^?/#]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  })();

  useEffect(() => {
    let aborted = false;
    async function generate() {
      // 开发模式下避免重复触发：若已有进行中的标记则直接进入推荐页
      try {
        if (sessionStorage.getItem("newDiary:recoInFlight") === "1") {
          sessionStorage.removeItem("newDiary:recoInFlight");
          if (!aborted) router.replace(`/new/recommend?next=${encodeURIComponent(next)}`);
          return;
        }
        sessionStorage.setItem("newDiary:recoInFlight", "1");
      } catch {}
      try {
        const dataUrl = typeof window !== "undefined" ? localStorage.getItem("newDiary:imageDataUrl") : null;
        // 若没有图片数据，直接进入推荐页（为空）
        if (!dataUrl) {
          if (!aborted) router.replace(`/new/recommend?next=${encodeURIComponent(next)}`);
          return;
        }
        // 调用后端生成推荐
        const resp = await fetch(`${BACKEND_BASE_URL}/recommend`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_url: dataUrl, top_k: 10 }),
        });
        if (resp.ok) {
          const items = await resp.json();
          try {
            localStorage.setItem("newDiary:recommendItems", JSON.stringify(items));
          } catch {}
          // 改为先展示推荐页，由用户确认后再写入日记
          if (!aborted) {
            try { sessionStorage.removeItem("newDiary:recoInFlight"); } catch {}
            router.replace(`/new/recommend?next=${encodeURIComponent(next)}`);
            return;
          }
        }
      } catch {}
      if (!aborted) router.replace(`/new/recommend?next=${encodeURIComponent(next)}`);
      try { sessionStorage.removeItem("newDiary:recoInFlight"); } catch {}
    }
    generate();
    return () => {
      aborted = true;
    };
  }, [next, router]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-24">
      <div className="relative mb-4 h-12 w-12">
        <div className="absolute inset-0 rounded-full border-4 border-brand-300/50" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-brand-700 border-t-transparent" />
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">正在上传图片并生成歌曲推荐，请稍候…</p>
    </div>
  );
}
