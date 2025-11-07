import { NextRequest, NextResponse } from "next/server";
import { deleteDiary, getDiaryById, updateDiary } from "@/lib/diaryRepo";
import { CURRENT_USER_ID } from "@/lib/config";

// GET /api/diaries/[id]
export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number.parseInt(idStr, 10);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });
  const row = await getDiaryById(id, CURRENT_USER_ID);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(row);
}

// PUT /api/diaries/[id]
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number.parseInt(idStr, 10);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });
  const body = await req.json().catch(() => ({} as any));
  const patch: any = {};
  if (body.date) patch.diary_datetime = new Date(body.date).toISOString().slice(0, 19).replace("T", " ");
  if ("startDate" in body) patch.trip_start = body.startDate ? new Date(body.startDate).toISOString().slice(0, 19).replace("T", " ") : null;
  if ("endDate" in body) patch.trip_end = body.endDate ? new Date(body.endDate).toISOString().slice(0, 19).replace("T", " ") : null;
  if ("location" in body) patch.location = body.location ?? "";
  if ("mood" in body) patch.mood = body.mood ?? "快乐";
  if ("text" in body) patch.content = body.text ?? "";
  if ("photos" in body) patch.photo_urls_json = JSON.stringify(body.photos || []);
  if ("trackIds" in body) patch.track_ids_json = JSON.stringify(body.trackIds || []);
  if ("isFavorite" in body) patch.is_favorite = body.isFavorite ? 1 : 0;

  const res: any = await updateDiary(id, CURRENT_USER_ID, patch);
  if (!res || typeof res.affectedRows === "number" && res.affectedRows === 0) {
    return NextResponse.json({ error: "not found or no change" }, { status: 404 });
  }
  const row = await getDiaryById(id, CURRENT_USER_ID);
  if (!row) return NextResponse.json({ error: "not found after update" }, { status: 404 });
  return NextResponse.json(row);
}

// DELETE /api/diaries/[id]
export async function DELETE(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number.parseInt(idStr, 10);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });
  await deleteDiary(id, CURRENT_USER_ID);
  return NextResponse.json({ ok: true });
}
