import type { Metadata } from "next";
import "./globals.css";
import FloatingNewButton from "@/components/FloatingNewButton";
import ConditionalGlobalAudioBar from "@/components/ConditionalGlobalAudioBar";

export const metadata: Metadata = {
  title: "PicMusic - 音乐旅行日记",
  description: "基于图片情绪推荐音乐的旅行日记应用",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`antialiased`}>
        {/* 初始主题设置，避免闪烁：优先 localStorage，其次系统偏好 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const t = localStorage.getItem('theme'); const m = window.matchMedia('(prefers-color-scheme: dark)').matches; const d = t ? t === 'dark' : m; const root = document.documentElement; root.classList.toggle('dark', d); root.style.colorScheme = d ? 'dark' : 'light'; } catch(e){} })();`,
          }}
        />
        <div className="min-h-dvh bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-950">
          {children}
          {/* 全局播放器（在新建加载页隐藏进度条）*/}
          <ConditionalGlobalAudioBar />
          {/* 全局悬浮新建按钮 */}
          <FloatingNewButton />
        </div>
      </body>
    </html>
  );
}
