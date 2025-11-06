"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FloatingNewButton() {
  const pathname = usePathname();
  // 可根据路由隐藏：在 /new 或编辑页不显示，避免重复/遮挡
  const hidden = pathname?.startsWith("/new") || pathname?.startsWith("/profile/edit");
  if (hidden) return null;

  return (
    <Link
      href="/new"
      aria-label="新建"
      className="fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-white shadow-lg ring-1 ring-brand-700/30 transition-transform hover:scale-105 hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-600 sm:bottom-8 sm:right-8"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-7 w-7"
        aria-hidden
      >
        <path d="M12 5c.552 0 1 .448 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H6a1 1 0 1 1 0-2h5V6c0-.552.448-1 1-1z" />
      </svg>
    </Link>
  );
}
