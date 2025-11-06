import { NextRequest, NextResponse } from "next/server";
import { getDiaryById, updateDiary } from "@/lib/diaryRepo";

// PUT /api/diaries/[id]/favorite
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json().catch(() => ({} as any));
  const cur = await getDiaryById(id, 1);
  if (!cur) return NextResponse.json({ error: "not found" }, { status: 404 });
  const next = typeof body.isFavorite === "boolean" ? body.isFavorite : !cur.isFavorite;
  await updateDiary(id, 1, { is_favorite: next });
  const updated = await getDiaryById(id, 1);
  return NextResponse.json(updated);
}
