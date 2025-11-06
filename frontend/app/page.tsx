import Header from "@/components/Header";
import Timeline from "@/components/Timeline";
import FeaturedCarouselClient from "@/components/FeaturedCarouselClient";
import MetricsBar from "@/components/MetricsBar";
import { getDiaries } from "@/lib/diaryRepo";

export default async function Home() {
  const diaries = await getDiaries(1);
  return (
    <div>
      <Header noSpacer />

      {/* 全宽（Full-bleed）轮播：与 Header 下边界对齐、无圆角 */}
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
        <FeaturedCarouselClient diaries={diaries} />
      </div>

      {/* 受限宽度的正文容器（更紧凑） */}
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-4 sm:px-8">
        {/* 定量指标模块：在“我的时光机”上方 */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">旅途概览</h2>
          <div className="mt-2">
            <MetricsBar
              footprints={[...new Set(diaries.map((d) => d.location))].length}
              memories={diaries.length}
              music={diaries.reduce((sum, d) => sum + (d.tracks?.length ?? 0), 0)}
            />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">我的时光机</h1>
        </div>

        <div className="mt-6">
          <Timeline diaries={diaries as any} />
        </div>
      </div>

      <footer className="mt-6 border-t border-zinc-200/80 py-6 dark:border-zinc-800/80">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
            © 2025 PicMusic · All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
