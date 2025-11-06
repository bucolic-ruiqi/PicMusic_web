"use client";

import { useMemo, useState } from "react";
import type { Diary } from "@/lib/types";
import Timeline from "@/components/Timeline";
import DiaryModal from "@/components/DiaryModal";

export default function HomeContent({ diaries }: { diaries: Diary[] }) {
  const [selected, setSelected] = useState<Diary | null>(null);
  const byId = useMemo(() => Object.fromEntries(diaries.map(d => [d.id, d])), [diaries]);

  return (
    <>
      <Timeline diaries={diaries} onDiaryClick={(d) => setSelected(byId[d.id] ?? d)} />
      <DiaryModal diary={selected} onClose={() => setSelected(null)} />
    </>
  );
}
