"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Header({ hideAvatar = false, noSpacer = false }: { hideAvatar?: boolean; noSpacer?: boolean }) {
  const router = useRouter();
  const [isDark, setIsDark] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    try {
      const root = document.documentElement;
      const current = root.classList.contains("dark");
      setIsDark(current);
    } catch {}
  }, []);

  // 页面滚动进度（0~1）
  useEffect(() => {
    const calc = () => {
      try {
        const doc = document.documentElement;
        const body = document.body;
        const scrollTop = doc.scrollTop || body.scrollTop || 0;
        const scrollHeight = doc.scrollHeight || body.scrollHeight || 1;
        const clientHeight = doc.clientHeight || window.innerHeight || 1;
        const denom = Math.max(1, scrollHeight - clientHeight);
        const p = Math.max(0, Math.min(1, scrollTop / denom));
        setScrollProgress(p);
      } catch {}
    };
    calc();
    window.addEventListener("scroll", calc, { passive: true } as AddEventListenerOptions);
    window.addEventListener("resize", calc);
    return () => {
      window.removeEventListener("scroll", calc as any);
      window.removeEventListener("resize", calc);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    try {
      const root = document.documentElement;
      const nextDark = !root.classList.contains("dark");
      root.classList.toggle("dark", nextDark);
      // Hint browsers for built-in UI theming
      root.style.colorScheme = nextDark ? "dark" : "light";
      localStorage.setItem("theme", nextDark ? "dark" : "light");
      setIsDark(nextDark);
    } catch {}
  }, []);

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    // 稍后聚焦，等待宽度动画展开
    setTimeout(() => searchInputRef.current?.focus(), 120);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setQuery("");
  }, []);

  const submitSearch = useCallback(() => {
    const q = query.trim();
    if (!q) return closeSearch();
    router.push(`/explore?q=${encodeURIComponent(q)}`);
    closeSearch();
  }, [query, router, closeSearch]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-white/30 bg-white/60 backdrop-blur-md backdrop-saturate-150 shadow-[0_10px_40px_rgba(31,38,135,0.08)] supports-[backdrop-filter]:bg-white/45 dark:border-white/10 dark:bg-zinc-900/40 dark:supports-[backdrop-filter]:bg-zinc-900/30">
        {/* 毛玻璃高光与遮罩层（不拦截点击） */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/70 via-white/40 to-white/20 dark:from-white/10 dark:via-white/5 dark:to-transparent" />
        {/* 顶部滚动进度条（主色调） */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[2px]">
          <div
            className="h-full bg-brand-700 transition-[width] duration-75 ease-out dark:bg-brand-500"
            style={{ width: `${Math.round(scrollProgress * 100)}%` }}
          />
        </div>
        <div className="relative flex items-center justify-between px-3 py-2 sm:px-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 active:opacity-80" aria-label="返回首页" title="返回首页">
            <Image src="/logo.png" alt="PicMusic" width={32} height={32} />
            <span className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">PicMusic</span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            {/* 搜索按钮 + 向左弹出的输入框（绝对定位，不会被容器裁切） */}
            <div className="relative">
              <button
                type="button"
                onClick={() => (searchOpen ? submitSearch() : openSearch())}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                aria-label="搜索"
                title="搜索"
              >
                {/* magnifier icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
              <div
                className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 overflow-hidden transition-[width] duration-200 ease-out z-[60]"
                style={{ width: searchOpen ? "min(200px, calc(100vw - 120px))" : 0 }}
              >
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitSearch();
                    if (e.key === "Escape") closeSearch();
                  }}
                  placeholder="搜索地点 / 心情 / 文字"
                  className="pointer-events-auto h-8 w-full rounded-full bg-zinc-100/80 px-3 text-sm text-zinc-700 outline-none placeholder:text-zinc-400 shadow-sm backdrop-blur dark:bg-zinc-800/70 dark:text-zinc-200 focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            {/* 深色模式切换 */}
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              aria-label="切换主题"
              title="切换主题"
            >
              {isDark ? (
                // Sun icon
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2m0 16v2M4 12H2m20 0h-2M5.64 5.64 4.22 4.22m15.56 15.56-1.42-1.42m0-12.72 1.42-1.42M4.22 19.78l1.42-1.42" />
                </svg>
              ) : (
                // Moon icon
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* 统一人物图标，指向个人页 */}
            {!hideAvatar && (
              <Link
                href="/profile"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                aria-label="个人中心"
                title="个人中心"
              >
                {/* User icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            )}
          </nav>
        </div>
      </header>
      {/* spacer to prevent content from being overlapped by fixed header (可在首页关闭以覆盖显示轮播) */}
      {!noSpacer && <div className="h-12" />}
    </>
  );
}
