"use client";

import { usePathname } from "next/navigation";
import GlobalAudioBar from "@/components/GlobalAudioBar";

export default function ConditionalGlobalAudioBar() {
  const pathname = usePathname() || "";
  // 在新建流程页面隐藏全局进度条（/new 及其子路由）
  if (pathname.startsWith("/new")) {
    return null;
  }
  return <GlobalAudioBar />;
}
