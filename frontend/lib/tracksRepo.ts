import { getPool } from "@/lib/db";
import type { Track } from "@/lib/types";

function fakeDuration(bpm?: number | null): number {
  if (!bpm || !Number.isFinite(bpm as any)) return 180;
  const base = 180;
  const adj = Math.max(-30, Math.min(30, Math.round((120 - (bpm as number)) * 0.3)));
  return Math.max(60, base + adj);
}

export async function getTracksByIds(ids: Array<string | number>): Promise<Track[]> {
  if (!ids || ids.length === 0) return [];
  // 保留为字符串，避免 JS number 精度丢失（tracks.id 为 BIGINT）
  const uniqueIds = Array.from(new Set(ids.map((v) => String(v)).filter(Boolean)));
  if (uniqueIds.length === 0) return [];
  const pool = getPool();
  const placeholders = uniqueIds.map(() => "?").join(",");
  const [rows] = await pool.query(
    `SELECT id, name, artist, bpm FROM tracks WHERE id IN (${placeholders}) ORDER BY FIELD(id, ${uniqueIds.map(() => "?").join(',')})`,
    [...uniqueIds, ...uniqueIds]
  );
  return (rows as any[]).map((r) => ({
    id: String(r.id),
    title: r.name as string,
    artist: r.artist as string,
    duration: fakeDuration(r.bpm as number | null),
  }));
}

export async function getTracksMapByIds(ids: Array<string | number>): Promise<Map<string, Track>> {
  const tracks = await getTracksByIds(ids);
  const map = new Map<string, Track>();
  for (const t of tracks) {
    map.set(String(t.id), t);
  }
  return map;
}
