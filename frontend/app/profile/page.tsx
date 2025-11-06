"use client";

import Header from "@/components/Header";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const mbtiTypes = [
  "INTJ","INTP","ENTJ","ENTP",
  "INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ",
  "ISTP","ISFP","ESTP","ESFP",
];

const musicGenresAll = [
  "轻音乐","古典音乐","流行","摇滚","爵士","蓝调",
  "电子音乐","嘻哈","民谣","乡村","金属","R&B",
  "独立音乐","世界音乐","新世纪",
];

export default function ProfilePage() {
  const [username, setUsername] = useState("旅人Aster");
  const [account, setAccount] = useState("aster@example.com");
  const [mbti, setMbti] = useState("INTJ-A");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(["轻音乐","独立音乐","电子音乐"]);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [editingUsername, setEditingUsername] = useState(false);
  const [editingAccount, setEditingAccount] = useState(false);
  const [draftUsername, setDraftUsername] = useState("");
  const [draftAccount, setDraftAccount] = useState("");

  // 初始化从 localStorage 读取
  useEffect(() => {
    try {
      const u = localStorage.getItem("username");
      if (u) setUsername(u);
      const acc = localStorage.getItem("account");
      if (acc) setAccount(acc);
      const a = localStorage.getItem("avatarUrl");
      if (a) setAvatarSrc(a);
      const m = localStorage.getItem("mbti");
      if (m) setMbti(m);
      const g = localStorage.getItem("musicGenres");
      if (g) {
        const arr = JSON.parse(g);
        if (Array.isArray(arr)) setSelectedGenres(arr);
      }
    } catch {}
  }, []);

  const handlePickAvatar = () => {
    // demo 替换头像
    const url = `https://i.pravatar.cc/150?u=${Date.now()}`;
    setAvatarSrc(url);
    try { localStorage.setItem("avatarUrl", url); } catch {}
  };

  const toggleGenre = (g: string) => {
    setSelectedGenres((prev) =>
      prev.includes(g)
        ? prev.filter((x) => x !== g)
        : prev.length < 5
        ? [...prev, g]
        : prev
    );
    // 立即持久化
    try {
      const next = selectedGenres.includes(g)
        ? selectedGenres.filter((x) => x !== g)
        : selectedGenres.length < 5
        ? [...selectedGenres, g]
        : selectedGenres;
      localStorage.setItem("musicGenres", JSON.stringify(next));
    } catch {}
  };

  // 点击外部关闭登出气泡
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!logoutOpen) return;
      const el = popoverRef.current;
      if (el && !el.contains(e.target as Node)) setLogoutOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [logoutOpen]);

  return (
    <div>
      <Header hideAvatar />

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-2 sm:px-6">
        {/* 顶部信息区：去卡片，保留简洁分隔线 */}
        <section className="py-4">
          <div className="flex items-start gap-6">
            {/* 左列：头像 + 按钮 */}
            <div className="mt-1 flex min-w-[4rem] flex-col items-start gap-2">
              <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-brand-300 dark:ring-brand-400/30">
                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt={username}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-600 to-brand-400 text-zinc-700">
                    <span className="text-lg font-semibold">{username[0]}</span>
                  </div>
                )}
              </div>
              <button
                className="rounded-full bg-brand-700 px-3 py-1 text-[11px] font-medium text-white hover:bg-brand-800"
                onClick={handlePickAvatar}
              >
                更换头像
              </button>
            </div>

            {/* 右列：用户名 + 邮箱 可编辑 */}
            <div className="min-w-0 flex-1">
              {/* 用户名块 */}
              <label className="text-xs text-zinc-500 dark:text-zinc-400">用户名</label>
              {!editingUsername ? (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {username}
                  </h1>
                  <button
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    aria-label="编辑用户名"
                    title="编辑用户名"
                    onClick={() => { setDraftUsername(username); setEditingUsername(true); }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="m12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    value={draftUsername}
                    onChange={(e) => setDraftUsername(e.target.value)}
                    maxLength={20}
                    className="w-64 border-b border-zinc-300 bg-transparent px-0 py-1 text-base outline-none focus:border-brand-600 dark:border-zinc-700 dark:focus:border-brand-600"
                  />
                  <button
                    className="rounded-full bg-brand-700 px-2 py-0.5 text-xs font-medium text-white hover:bg-brand-800"
                    onClick={() => { setUsername(draftUsername); try { localStorage.setItem("username", draftUsername); } catch {}; setEditingUsername(false); }}
                  >
                    保存
                  </button>
                  <button
                    className="rounded-full px-2 py-0.5 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    onClick={() => setEditingUsername(false)}
                  >
                    取消
                  </button>
                </div>
              )}

              {/* 邮箱块 */}
              <label className="mt-4 block text-xs text-zinc-500 dark:text-zinc-400">邮箱</label>
              {!editingAccount ? (
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm text-zinc-500">{account}</p>
                  <button
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    aria-label="编辑邮箱"
                    title="编辑邮箱"
                    onClick={() => { setDraftAccount(account); setEditingAccount(true); }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="m12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    value={draftAccount}
                    onChange={(e) => setDraftAccount(e.target.value)}
                    inputMode="email"
                    className="w-72 border-b border-zinc-300 bg-transparent px-0 py-1 text-sm outline-none focus:border-brand-600 dark:border-zinc-700 dark:focus:border-brand-600"
                  />
                  <button
                    className="rounded-full bg-brand-700 px-2 py-0.5 text-xs font-medium text-white hover:bg-brand-800"
                    onClick={() => { setAccount(draftAccount); try { localStorage.setItem("account", draftAccount); } catch {}; setEditingAccount(false); }}
                  >
                    保存
                  </button>
                  <button
                    className="rounded-full px-2 py-0.5 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    onClick={() => setEditingAccount(false)}
                  >
                    取消
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 border-t border-zinc-200/80 dark:border-zinc-800/80" />
        </section>

        {/* 偏好设置：左右分列 */}
        <section className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* MBTI 选择 */}
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">MBTI 性格类型</h2>
            <p className="mt-1 text-xs text-zinc-500">选择一种</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {mbtiTypes.map((t) => {
                const selected = t === mbti;
                return (
                  <button
                    key={t}
                    onClick={() => { setMbti(t); try { localStorage.setItem("mbti", t); } catch {} }}
                    className={
                      "rounded-full px-3 py-1 text-sm transition-colors " +
                      (selected
                        ? "bg-brand-700 text-white hover:bg-brand-800"
                        : "border border-brand-300/80 text-brand-800 hover:bg-brand-50 dark:border-brand-400/30 dark:text-brand-100 dark:hover:bg-brand-900/20")
                    }
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 音乐风格多选 */}
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">音乐风格</h2>
            <p className="mt-1 text-xs text-zinc-500">最多 5 个</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {musicGenresAll.map((g) => {
                const selected = selectedGenres.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => toggleGenre(g)}
                    className={
                      "rounded-full px-3 py-1 text-sm transition-colors " +
                      (selected
                        ? "bg-brand-200 text-brand-900 hover:bg-brand-300 dark:bg-brand-900/60 dark:text-brand-100"
                        : "border border-brand-300/80 text-brand-800 hover:bg-brand-50 dark:border-brand-400/30 dark:text-brand-100 dark:hover:bg-brand-900/20")
                    }
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 退出登录：文本按钮，无边框 */}
        <section className="mt-6">
          <div className="relative" ref={popoverRef}>
            <button
              className="mx-auto block rounded-full border border-zinc-300 bg-white px-4 py-1.5 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              onClick={() => setLogoutOpen((v) => !v)}
              aria-haspopup="dialog"
              aria-expanded={logoutOpen}
            >
              退出登录
            </button>
            {logoutOpen && (
              <div className="absolute left-1/2 -top-2 z-50 w-72 -translate-x-1/2 -translate-y-full rounded-xl border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                <div className="text-sm text-zinc-700 dark:text-zinc-200">确认要退出当前账号吗？</div>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    className="rounded-full px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    onClick={() => setLogoutOpen(false)}
                  >
                    取消
                  </button>
                  <button
                    className="rounded-full bg-brand-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-800"
                    onClick={() => {
                      setLogoutOpen(false);
                      // TODO: 接入真实登出逻辑
                      console.log("logout");
                    }}
                  >
                    退出
                  </button>
                </div>
                {/* 小三角 */}
                <div className="pointer-events-none absolute bottom-0 left-1/2 h-2 w-2 translate-y-full -translate-x-1/2 rotate-45 border-b border-r border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900" />
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
