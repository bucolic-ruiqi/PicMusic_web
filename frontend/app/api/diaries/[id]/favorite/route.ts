import { NextRequest, NextResponse } from "next/server";
import { getDiaryById, updateDiary } from "@/lib/diaryRepo";
import { CURRENT_USER_ID } from "@/lib/config";

// PUT /api/diaries/[id]/favorite
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number.parseInt(idStr, 10);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });
  const body = await req.json().catch(() => ({} as any));
  const cur = await getDiaryById(id, CURRENT_USER_ID);
  if (!cur) return NextResponse.json({ error: "not found" }, { status: 404 });
  const next = typeof body.isFavorite === "boolean" ? body.isFavorite : !cur.isFavorite;
  await updateDiary(id, CURRENT_USER_ID, { is_favorite: next });
  const updated = await getDiaryById(id, CURRENT_USER_ID);
  return NextResponse.json(updated);
}
