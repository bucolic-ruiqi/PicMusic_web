import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

function toInt(v: any, def = 10) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), 100) : def;
}

// 简单估算时长（若无 BPM 信息则默认 180 秒）
function estimateDuration(bpm?: number | null): number {
  if (!bpm || !Number.isFinite(bpm)) return 180;
  // 假设常见结构下平均 3 分钟左右，做个轻微偏移以免都相同
  const base = 180;
  const adj = Math.max(-30, Math.min(30, Math.round((120 - bpm) * 0.3)));
  return Math.max(60, base + adj);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mood = searchParams.get("mood") || "";
  const limit = toInt(searchParams.get("limit"), 10);

  try {
    const pool = getPool();
    // 优先按情绪匹配，其次随机补齐
    const [rows] = await pool.query(
      `SELECT id, name, artist, bpm, dominant_emotion
         FROM tracks
        ORDER BY CASE WHEN dominant_emotion = ? THEN 0 ELSE 1 END, RAND()
        LIMIT ?`,
      [mood, limit]
    );

    const data = (rows as any[]).map((r) => ({
      id: String(r.id),
      title: r.name as string,
      artist: r.artist as string,
      duration: estimateDuration(r.bpm as number | null),
    }));

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("/api/tracks/recommend error:", err);
    return NextResponse.json({ error: err?.message || "unknown error" }, { status: 500 });
  }
}
