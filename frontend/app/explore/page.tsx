import Link from "next/link";
import Header from "@/components/Header";
import { diaries } from "@/data/diaries";

function fmtDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC",
    }).format(new Date(iso));
  } catch {
    const d = new Date(iso);
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    return `${d.getUTCFullYear()}/${mm}/${dd}`;
  }
}

export default function ExplorePage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q || "").trim();
  const qLower = q.toLowerCase();
  const results = q
    ? diaries.filter((d) => {
        const hay = `${d.location} ${d.text || ""} ${d.mood || ""}`.toLowerCase();
        return hay.includes(qLower);
      })
    : diaries;

  return (
    <div>
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-4 sm:px-6">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">搜索</h1>
        {q && (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            关键字：<span className="font-medium text-zinc-700 dark:text-zinc-200">{q}</span> · 共 {results.length} 条结果
          </p>
        )}

        <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((d) => (
            <li key={d.id} className="rounded-lg border border-zinc-200 p-3 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/40">
              <Link href={`/diary/${d.id}`} className="block">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">{fmtDate(d.date)}</div>
                <div className="mt-1 line-clamp-1 font-medium text-zinc-900 dark:text-zinc-100">{d.location}</div>
                {d.text && <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-300">{d.text}</p>}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
