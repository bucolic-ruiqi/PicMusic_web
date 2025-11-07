import { getPool } from "@/lib/db";
import type { Diary } from "@/lib/types";
import { getTracksMapByIds } from "@/lib/tracksRepo";

function toISO(dt: any | null): string | undefined {
  if (!dt) return undefined;
  // MySQL DATETIME returns as Date; ensure ISO string
  try {
    const d = dt instanceof Date ? dt : new Date(dt);
    return d.toISOString();
  } catch {
    return undefined;
  }
}

function ensureArray(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try {
    const parsed = typeof v === "string" ? JSON.parse(v) : v;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseIdArrayAsStrings(v: any): string[] {
  const arr = ensureArray(v) as any[];
  return arr.map((x) => String(x)).filter((s) => !!s);
}

export function rowToDiary(row: any): Diary & { isFavorite?: boolean } {
  return {
    id: String(row.id),
    date: toISO(row.diary_datetime) || new Date().toISOString(),
    startDate: toISO(row.trip_start),
    endDate: toISO(row.trip_end),
    location: row.location ?? "",
    mood: row.mood ?? "快乐",
    text: row.content ?? "",
    photos: ensureArray(row.photo_urls_json),
    // optional:
    isFavorite: Boolean(row.is_favorite),
  } as any;
}

export async function getDiaries(userId = 1): Promise<(Diary & { isFavorite?: boolean })[]> {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, user_id, diary_datetime, trip_start, trip_end, location, mood, content,
            photo_urls_json, track_ids_json, is_favorite
       FROM diaries
      WHERE user_id = ?
      ORDER BY diary_datetime DESC, id DESC`,
    [userId]
  );
  const list = (rows as any[]);
  // 批量收集所有 track id 并一次查询，避免 N+1
  const allIds: number[] = [];
  for (const r of list) {
    const ids = parseIdArrayAsStrings(r.track_ids_json);
    (allIds as any).push(...ids);
  }
  const idSet = Array.from(new Set(allIds as any as string[]));
  const trackMap = await getTracksMapByIds(idSet);

  return list.map((r) => {
    const d = rowToDiary(r);
    const ids = parseIdArrayAsStrings(r.track_ids_json);
    if (ids.length) {
      const tracks = ids
        .map((id) => trackMap.get(String(id)))
        .filter(Boolean) as any[];
      (d as any).tracks = tracks;
    }
    return d;
  });
}

export async function getDiaryById(id: number, userId = 1): Promise<(Diary & { isFavorite?: boolean }) | null> {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, user_id, diary_datetime, trip_start, trip_end, location, mood, content,
            photo_urls_json, track_ids_json, is_favorite
       FROM diaries
      WHERE id = ? AND user_id = ?
      LIMIT 1`,
    [id, userId]
  );
  const r = (rows as any[])[0];
  if (!r) return null;
  const d = rowToDiary(r);
  const ids = parseIdArrayAsStrings(r.track_ids_json);
  if (ids.length) {
    const trackMap = await getTracksMapByIds(ids);
    const tracks = ids.map((tid) => trackMap.get(String(tid))).filter(Boolean) as any[];
    (d as any).tracks = tracks;
  }
  return d;
}

export async function updateDiary(
  id: number,
  userId: number,
  payload: Partial<{
    diary_datetime: string;
    trip_start: string | null;
    trip_end: string | null;
    location: string;
    mood: string;
    content: string;
    photo_urls_json: string; // JSON string
    track_ids_json: string; // JSON string
    is_favorite: boolean;
  }>
) {
  const pool = getPool();
  const fields: string[] = [];
  const values: any[] = [];
  for (const [k, v] of Object.entries(payload)) {
    fields.push(`${k} = ?`);
    values.push(v);
  }
  if (!fields.length) return { affectedRows: 0 } as any;
  values.push(id, userId);
  const [res] = await pool.query(
    `UPDATE diaries SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`,
    values
  );
  return res as any;
}

export async function deleteDiary(id: number, userId = 1) {
  const pool = getPool();
  const [res] = await pool.query(`DELETE FROM diaries WHERE id = ? AND user_id = ?`, [id, userId]);
  return res as any;
}

export async function createDiary(userId: number, data: {
  diary_datetime: string;
  trip_start?: string | null;
  trip_end?: string | null;
  location: string;
  mood: string;
  content: string;
  photo_urls_json?: string; // JSON
  track_ids_json?: string; // JSON
  is_favorite?: boolean;
}) {
  const pool = getPool();
  const [res] = await pool.query(
    `INSERT INTO diaries (user_id, diary_datetime, trip_start, trip_end, location, mood, content,
                          photo_urls_json, track_ids_json, is_favorite)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
    [
      userId,
      data.diary_datetime,
      data.trip_start ?? null,
      data.trip_end ?? null,
      data.location,
      data.mood,
      data.content,
      data.photo_urls_json ?? "[]",
      data.track_ids_json ?? "[]",
      data.is_favorite ? 1 : 0,
    ]
  );
  return res as any;
}

export async function searchDiariesByLocation(
  q: string,
  userId = 1,
  limit = 10
): Promise<Pick<Diary, "id" | "location" | "date">[]> {
  const pool = getPool();
  const like = `%${q}%`;
  const [rows] = await pool.query(
    `SELECT id, diary_datetime, location
       FROM diaries
      WHERE user_id = ? AND location LIKE ?
      ORDER BY diary_datetime DESC, id DESC
      LIMIT ?`,
    [userId, like, Math.max(1, Math.min(50, Number(limit) || 10))]
  );
  return (rows as any[]).map((r) => ({
    id: String(r.id),
    location: r.location ?? "",
    date: toISO(r.diary_datetime) || new Date().toISOString(),
  }));
}
