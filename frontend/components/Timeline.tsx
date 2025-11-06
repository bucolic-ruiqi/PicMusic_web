import DiaryCard from "@/components/DiaryCard";
import type { Diary } from "@/lib/types";

function groupByYear(diaries: Diary[]) {
  const groups: Record<string, Diary[]> = {};
  for (const d of diaries) {
    const end = new Date(d.endDate ?? d.date);
    const y = end.getFullYear().toString();
    (groups[y] ||= []).push(d);
  }
  const entries = Object.entries(groups).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  // sort each year by date asc for horizontal axis
  for (const [, arr] of entries) arr.sort((a, b) => +new Date(a.endDate ?? a.date) - +new Date(b.endDate ?? b.date));
  return entries;
}

export default function Timeline({ diaries, onDiaryClick }: { diaries: Diary[]; onDiaryClick?: (d: Diary) => void }) {
  const groups = groupByYear(diaries);
  return (
    <div className="space-y-3">
      {groups.map(([year, items]) => (
        <YearRow key={year} year={year} items={items} onDiaryClick={onDiaryClick} />
      ))}
    </div>
  );
}

function YearRow({ year, items, onDiaryClick }: { year: string; items: Diary[]; onDiaryClick?: (d: Diary) => void }) {
  // Distinct months that have entries (0-11), ascending
  const months = Array.from(
    new Set(items.map((d) => new Date(d.endDate ?? d.date).getMonth()))
  ).sort((a, b) => a - b);

  const monthIndexMap = new Map<number, number>();
  months.forEach((m, idx) => monthIndexMap.set(m, idx));

  const monthWidth = 280; // px per visible month segment
  const paddingX = 32; // left/right paddings
  const cardW = 260;
  const cardH = Math.round((cardW * 3) / 4); // 195 for 4:3
  const topOffset = 64; // increase distance from month axis to cards
  const laneGap = 150; // tighten lane gap
  const bottomPad = 4;
  const tracks: { diary: Diary; left: number; lane: number }[] = [];
  const monthLaneCount: Record<number, number> = {};

  for (const d of items) {
    const m = new Date(d.endDate ?? d.date).getMonth();
    const order = monthIndexMap.get(m) ?? 0;
    const lane = monthLaneCount[m] ?? 0;
    monthLaneCount[m] = lane + 1;
    const left = paddingX + order * monthWidth;
    tracks.push({ diary: d, left, lane });
  }
  const maxLane = Math.max(0, ...Object.values(monthLaneCount));
  // Height precisely fits: topOffset + (maxLane-1)*laneGap + card height + bottomPad
  const height = topOffset + Math.max(0, maxLane - 1) * laneGap + cardH + bottomPad;

  return (
    <section className="relative">
      <div className="mb-3 flex items-center gap-3" style={{ marginLeft: paddingX }}>
        <div className="h-8 w-1 rounded-full bg-gradient-to-b from-brand-700 to-brand-500" />
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{year}</h2>
      </div>
      <div className="overflow-x-auto">
        <div
          className="relative p-1.5"
          style={{ width: paddingX * 2 + monthWidth * months.length, height }}
        >
          {/* Axis */}
          <div className="absolute left-0 right-0" style={{ top: 32 }}>
            <div className="h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent dark:via-brand-800" />
            {months.map((m) => {
              const order = monthIndexMap.get(m) ?? 0;
              return (
                <div key={m} className="absolute -translate-x-1/2" style={{ left: paddingX + order * monthWidth }}>
                  <div className="h-2 w-px bg-brand-300 dark:bg-brand-700" />
                  <div className="mt-1.5 text-center text-[11px] font-medium text-brand-700 dark:text-brand-400">
                    {m + 1}月
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cards placed on lanes */}
          {tracks.map(({ diary, left, lane }) => (
            <div
              key={diary.id}
              className="absolute w-[260px]"
              style={{ left, top: topOffset + lane * laneGap }}
            >
              <DiaryCard diary={diary} onClick={onDiaryClick} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
