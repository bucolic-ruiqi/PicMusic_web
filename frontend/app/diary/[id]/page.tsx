import Header from "@/components/Header";
import type { Diary } from "@/lib/types";
import Link from "next/link";
// 强制动态渲染，避免某些环境下动态段未生成导致的访问异常
export const dynamic = "force-dynamic";
import DiaryEditor from "@/components/DiaryEditor";
import { getDiaryById, getDiaries } from "@/lib/diaryRepo";
import { CURRENT_USER_ID } from "@/lib/config";

function fmtRange(d: Diary) {
  const end = new Date(d.endDate ?? d.date);
  const start = new Date(d.startDate ?? end.getTime() - 2 * 24 * 60 * 60 * 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (start.getFullYear() === end.getFullYear()) {
    return `${end.getFullYear()}.${start.getMonth() + 1}.${pad(start.getDate())} – ${end.getMonth() + 1}.${pad(end.getDate())}`;
  }
  const s = `${start.getFullYear()}.${start.getMonth() + 1}.${pad(start.getDate())}`;
  const e = `${end.getFullYear()}.${end.getMonth() + 1}.${pad(end.getDate())}`;
  return `${s} – ${e}`;
}

export default async function DiaryDetail(props: { params: Promise<{ id?: string }> }) {
  const { id: idMaybe } = await props.params;
  const idRaw = idMaybe ?? "";
  let id: string;
  try {
    id = decodeURIComponent(idRaw);
  } catch {
    id = String(idRaw ?? "");
  }
  const idNum = Number(id);
  let diary = Number.isFinite(idNum) ? await getDiaryById(idNum, CURRENT_USER_ID) : null;
  // 兜底：若找不到，允许使用首条数据，避免 404 打断体验
  if (!diary) {
    const list = await getDiaries(CURRENT_USER_ID);
    diary = list[0] as any;
  }

  return (
    <div>
      <Header />
      <div className="mx-auto max-w-7xl px-6 pb-4 pt-4 sm:px-8">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
          ← 返回时间线
        </Link>
      </div>
      {diary ? <DiaryEditor initial={diary as Diary} /> : null}
    </div>
  );
}
