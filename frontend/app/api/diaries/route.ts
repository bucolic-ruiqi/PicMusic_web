import { NextRequest, NextResponse } from "next/server";
import { createDiary, getDiaries } from "@/lib/diaryRepo";

// GET /api/diaries
export async function GET() {
  const list = await getDiaries(1);
  return NextResponse.json(list);
}

// POST /api/diaries
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const {
    date,
    startDate,
    endDate,
    location = "",
    mood = "快乐",
    text = "",
    photos = [],
    trackIds = [],
    isFavorite = false,
  } = body || {};

  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

  await createDiary(1, {
    diary_datetime: new Date(date).toISOString().slice(0, 19).replace("T", " "),
    trip_start: startDate ? new Date(startDate).toISOString().slice(0, 19).replace("T", " ") : null,
    trip_end: endDate ? new Date(endDate).toISOString().slice(0, 19).replace("T", " ") : null,
    location,
    mood,
    content: text,
    photo_urls_json: JSON.stringify(photos || []),
    track_ids_json: JSON.stringify(trackIds || []),
    is_favorite: !!isFavorite,
  });

  const list = await getDiaries(1);
  return NextResponse.json(list, { status: 201 });
}
