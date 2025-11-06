"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  previews: string[];
  onSelected: (files: File[], previewUrls: string[]) => void;
  onRemove?: (index: number) => void;
};

export default function MultiUploadArea({ previews, onSelected, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (list.length === 0) return;
      const urls = list.map((f) => URL.createObjectURL(f));
      onSelected(list, urls);
    },
    [onSelected]
  );

  return (
    <div>
      <div
        className={
          "group relative flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl p-6 transition " +
          (dragOver
            ? "bg-brand-50/60 dark:bg-brand-900/20"
            : "bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/40")
        }
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <div className="pointer-events-none z-10 flex flex-col items-center text-center">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">点击或拖拽照片到此处</span>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {previews.map((src, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`预览 ${i + 1}`} className="h-full w-full object-cover" />
              {onRemove && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(i);
                  }}
                  className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
                  aria-label="删除"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
