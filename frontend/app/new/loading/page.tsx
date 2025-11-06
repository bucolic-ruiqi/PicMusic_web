"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoadingRecommendationPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/diary/d5";

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace(next);
    }, 1500);
    return () => clearTimeout(t);
  }, [next, router]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-24">
      <div className="relative mb-4 h-12 w-12">
        <div className="absolute inset-0 rounded-full border-4 border-brand-300/50" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-brand-700 border-t-transparent" />
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">正在生成歌曲推荐，请稍候…</p>
    </div>
  );
}
