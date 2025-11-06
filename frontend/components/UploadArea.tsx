"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onSelected: (file: File, previewUrl: string) => void;
  previewUrl: string | null;
};

export default function UploadArea({ onSelected, previewUrl }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      onSelected(file, url);
    },
    [onSelected]
  );

  return (
    <div>
      <div
        className={
          "group relative flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition " +
          (dragOver
            ? "border-blue-400 bg-blue-50/50 dark:border-blue-600/70 dark:bg-blue-500/10"
            : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/40")
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
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="preview"
            className="absolute inset-0 h-full w-full rounded-xl object-cover"
          />
        ) : null}

        <div className="pointer-events-none z-10 flex flex-col items-center text-center">
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm ring-1 ring-zinc-200 backdrop-blur dark:bg-zinc-900/70 dark:text-zinc-300 dark:ring-zinc-700">
            点击或拖拽图片到此处
          </span>
          <p className="mt-2 text-xs text-zinc-500">支持 JPG/PNG，最大 10MB</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
