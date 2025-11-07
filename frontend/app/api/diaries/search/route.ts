import { NextRequest, NextResponse } from "next/server";
import { searchDiariesByLocation } from "@/lib/diaryRepo";
import { CURRENT_USER_ID } from "@/lib/config";

// GET /api/diaries/search?q=杭州&limit=8
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const limit = Number(searchParams.get("limit") || 8);
  if (!q) return NextResponse.json([]);
  const rows = await searchDiariesByLocation(q, CURRENT_USER_ID, limit);
  return NextResponse.json(rows);
}
