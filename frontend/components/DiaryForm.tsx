"use client";

import { useRef, useState } from "react";
import type { DiaryFormValues, Mood } from "@/lib/types";

const MOODS: { value: Mood; label: string }[] = [
  { value: "快乐", label: "😀 快乐" },
  { value: "开心", label: "😊 开心" },
  { value: "放松", label: "😌 放松" },
  { value: "宁静", label: "🏞️ 宁静" },
  { value: "怀旧", label: "📼 怀旧" },
  { value: "惊喜", label: "✨ 惊喜" },
  { value: "治愈", label: "🌿 治愈" },
  { value: "伤感", label: "🥲 伤感" },
  { value: "孤独", label: "🌙 孤独" },
  { value: "沉思", label: "💭 沉思" },
  { value: "疲惫", label: "😮‍💨 疲惫" },
];

type Props = {
  onSubmit: (values: DiaryFormValues) => void;
};

export default function DiaryForm({ onSubmit }: Props) {
  const [location, setLocation] = useState("");
  const [mood, setMood] = useState<Mood>("快乐");
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);
  const [text, setText] = useState("");
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // 极简 Markdown 渲染：支持\n 换行、`行内代码`、**加粗**、*斜体*、[链接](url)
  function mdToHtml(src: string) {
    let s = src
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    // 标题（H1–H3）需在换行转换前处理
    s = s.replace(/^###\s+(.+)$/gm, "<h3 class='mt-2 mb-1 text-base font-semibold text-brand-800 dark:text-brand-200'>$1</h3>");
    s = s.replace(/^##\s+(.+)$/gm, "<h2 class='mt-2 mb-1 text-lg font-semibold text-brand-800 dark:text-brand-200'>$1</h2>");
    s = s.replace(/^#\s+(.+)$/gm, "<h1 class='mt-2 mb-1 text-xl font-semibold text-brand-800 dark:text-brand-200'>$1</h1>");
    s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
    s = s.replace(/`([^`]+?)`/g, "<code class='rounded bg-zinc-100 px-1 py-0.5 text-[12px] dark:bg-zinc-800'>$1</code>");
    s = s.replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, "<a class='text-brand-700 underline' href='$2' target='_blank' rel='noreferrer'>$1</a>");
    s = s.replace(/\n/g, "<br/>");
    return s;
  }

  // 文本操作辅助
  const wrapSelection = (prefix: string, suffix: string, placeholder = "") => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = (text.substring(start, end) || placeholder);
    const next = text.substring(0, start) + prefix + selected + suffix + text.substring(end);
    setText(next);
    // 恢复光标位置到包裹内容末尾
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + prefix.length + selected.length + suffix.length;
      el.setSelectionRange(caret, caret);
    });
  };

  const insertAtLineStart = (prefix: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
  const prevNewline = text.lastIndexOf("\n", Math.max(0, start - 1));
  const lineStart = prevNewline === -1 ? 0 : prevNewline + 1;
    const next = text.substring(0, lineStart) + prefix + text.substring(lineStart);
    setText(next);
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + prefix.length;
      el.setSelectionRange(caret, caret);
    });
  };

  return (
    <form
      id="new-diary-form"
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ location, mood, startDate, endDate, text });
      }}
    >
      <label className="text-sm font-medium text-brand-800 dark:text-brand-200">地点</label>
      <input
        type="text"
        placeholder="比如：杭州·西湖"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="w-full rounded-lg border border-brand-200/60 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-brand-500/30 dark:border-brand-900/40"
      />

      <label className="mt-1 text-sm font-medium text-brand-800 dark:text-brand-200">心情</label>
      <div className="-mx-1 overflow-x-auto whitespace-nowrap py-2">
        <div className="mx-1 inline-flex gap-2">
        {MOODS.map((m) => (
          <button
            type="button"
            key={m.value}
            onClick={() => setMood(m.value)}
            className={
              "rounded-full px-3 py-1 text-sm ring-1 transition " +
              (m.value === mood
                ? "bg-brand-700 text-white ring-brand-700"
                : "bg-brand-50 text-brand-800 ring-brand-200 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-100 dark:ring-brand-800/60 hover:dark:bg-brand-900/50")
            }
          >
            {m.label}
          </button>
        ))}
        </div>
      </div>

      <label className="mt-1 text-sm font-medium text-brand-800 dark:text-brand-200">日期</label>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="mb-1 block text-xs text-zinc-500">开始</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-brand-200/60 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-brand-900/40"
          />
        </div>
        <div>
          <span className="mb-1 block text-xs text-zinc-500">结束</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-brand-200/60 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-brand-900/40"
          />
        </div>
      </div>

      <div className="mt-1 flex items-center justify-between">
        <label className="text-sm font-medium text-brand-800 dark:text-brand-200">旅行札记</label>
        <div className="space-x-1 text-xs">
          <button
            type="button"
            onClick={() => setPreview(false)}
            className={"rounded-full px-2 py-1 " + (!preview ? "bg-brand-700 text-white" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800")}
          >
            编辑
          </button>
          <button
            type="button"
            onClick={() => setPreview(true)}
            className={"rounded-full px-2 py-1 " + (preview ? "bg-brand-700 text-white" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800")}
          >
            预览
          </button>
        </div>
      </div>
      {!preview ? (
        <>
        {/* 工具栏 */}
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
          <button type="button" onClick={() => insertAtLineStart("# ")} className="rounded bg-brand-50 px-2 py-1 text-brand-800 ring-1 ring-brand-200 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-100 dark:ring-brand-800/60">H1</button>
          <button type="button" onClick={() => insertAtLineStart("## ")} className="rounded bg-brand-50 px-2 py-1 text-brand-800 ring-1 ring-brand-200 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-100 dark:ring-brand-800/60">H2</button>
          <button type="button" onClick={() => insertAtLineStart("### ")} className="rounded bg-brand-50 px-2 py-1 text-brand-800 ring-1 ring-brand-200 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-100 dark:ring-brand-800/60">H3</button>
          <span className="mx-1 h-4 w-px bg-zinc-300 dark:bg-zinc-700" />
          <button type="button" onClick={() => wrapSelection("**", "**", "加粗文本")} className="rounded bg-brand-50 px-2 py-1 text-brand-800 ring-1 ring-brand-200 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-100 dark:ring-brand-800/60">B</button>
          <button type="button" onClick={() => wrapSelection("*", "*", "斜体文本")} className="rounded bg-brand-50 px-2 py-1 text-brand-800 ring-1 ring-brand-200 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-100 dark:ring-brand-800/60">I</button>
          <button type="button" onClick={() => wrapSelection("`", "`", "code")} className="rounded bg-brand-50 px-2 py-1 text-brand-800 ring-1 ring-brand-200 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-100 dark:ring-brand-800/60">Code</button>
          <button type="button" onClick={() => wrapSelection("[", "](https://)", "链接文字")} className="rounded bg-brand-50 px-2 py-1 text-brand-800 ring-1 ring-brand-200 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-100 dark:ring-brand-800/60">Link</button>
        </div>
        <textarea
          ref={textareaRef}
          rows={6}
          placeholder="支持 Markdown：# H1、## H2、### H3、**加粗**、*斜体*、`代码`、[链接](https://example.com)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-lg border border-brand-200/60 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-brand-500/30 dark:border-brand-900/40"
        />
        </>
      ) : (
        <div
          className="prose prose-zinc max-w-none rounded-lg border border-brand-200/60 bg-white/60 p-3 text-sm dark:border-brand-900/40 dark:bg-zinc-900/30"
          dangerouslySetInnerHTML={{ __html: mdToHtml(text) }}
        />
      )}

      {/* 提交按钮将在上层页面居中展示，这里保留表单提交能力但隐藏按钮 */}
      <button type="submit" className="hidden">提交</button>
    </form>
  );
}
