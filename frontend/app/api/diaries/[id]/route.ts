import { NextRequest, NextResponse } from "next/server";
import { deleteDiary, getDiaryById, updateDiary } from "@/lib/diaryRepo";

// GET /api/diaries/[id]
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const row = await getDiaryById(id, 1);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(row);
}

// PUT /api/diaries/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
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

  await updateDiary(id, 1, patch);
  const row = await getDiaryById(id, 1);
  if (!row) return NextResponse.json({ error: "not found after update" }, { status: 404 });
  return NextResponse.json(row);
}

// DELETE /api/diaries/[id]
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  await deleteDiary(id, 1);
  return NextResponse.json({ ok: true });
}
