"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import MultiUploadArea from "@/components/MultiUploadArea";
import DiaryForm from "@/components/DiaryForm";
import type { DiaryFormValues } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function NewDiaryPage() {
  const router = useRouter();
  const [previews, setPreviews] = useState<string[]>([]);
  const [formValues, setFormValues] = useState<DiaryFormValues | null>(null);

  // 提交后创建日记，拿到真实 id 再进入加载页
  const [creating, setCreating] = useState(false);

  // 清理上一次的临时图片数据
  useEffect(() => {
    try {
      localStorage.removeItem("newDiary:imageDataUrl");
    } catch {}
  }, []);

  const handleSelected = (files: File[], urls: string[]) => {
    setPreviews((prev) => [...prev, ...urls]);
    setFormValues(null);

    // 将首张图片转为 dataURL 存到 localStorage，供后续推荐接口使用
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const dataUrl = typeof reader.result === "string" ? reader.result : null;
          if (dataUrl) localStorage.setItem("newDiary:imageDataUrl", dataUrl);
        } catch {}
      };
      try {
        reader.readAsDataURL(file);
      } catch {}
    }
  };

  const handleSubmitForm = async (v: DiaryFormValues) => {
    setFormValues(v);
    if (creating) return;
    setCreating(true);
    try {
      const resp = await fetch("/api/diaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString(),
          startDate: v.startDate,
          endDate: v.endDate,
          location: v.location,
          mood: v.mood,
          text: v.text,
          photos: previews,
          trackIds: [],
          isFavorite: false,
        }),
      });
      if (resp.ok) {
        const json = await resp.json();
        const id = Array.isArray(json) ? Number(json[0]?.id) : Number(json?.id);
        const next = Number.isFinite(id) ? `/diary/${id}` : "/";
        router.push(`/new/loading?next=${encodeURIComponent(next)}`);
      } else {
        router.push("/new/loading?next=%2F");
      }
    } finally {
      setCreating(false);
    }
  };

  const readyForForm = previews.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6">
      <Header />

      {/* 去卡片化：分两栏内容区，采用标题 + 内容，区块间使用分隔线 */}
      <section className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-brand-800 dark:text-brand-200">上传旅途照片</h2>
          <div className="rounded-lg border border-dashed border-brand-300/80 p-4 dark:border-brand-900/40">
            <MultiUploadArea previews={previews} onSelected={handleSelected} onRemove={(i)=>setPreviews((arr)=>arr.filter((_,idx)=>idx!==i))} />
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-brand-800 dark:text-brand-200">旅行信息</h2>
          {readyForForm ? (
            <DiaryForm onSubmit={handleSubmitForm} />
          ) : (
            <p className="text-sm text-zinc-500">请先选择至少一张照片。</p>
          )}
        </div>
      </section>

      {/* 居中 CTA：生成歌曲推荐 */}
      <div className="mt-10 flex justify-center">
        <button
          disabled={!readyForForm}
          onClick={() => {
            const form = document.getElementById("new-diary-form") as HTMLFormElement | null;
            form?.requestSubmit();
          }}
          className={
            "rounded-full px-6 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 " +
            (readyForForm
              ? "bg-brand-700 text-white hover:bg-brand-800 focus:ring-brand-500/40"
              : "cursor-not-allowed bg-zinc-300 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400")
          }
        >
          {creating ? "创建中…" : "生成歌曲推荐"}
        </button>
      </div>
    </div>
  );
}
