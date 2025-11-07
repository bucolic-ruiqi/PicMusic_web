import { getPool } from "@/lib/db";

export type User = {
  id: number;
  username: string;
  email: string | null;
  createdAt: string; // ISO
};

function toISO(dt: any | null): string | undefined {
  if (!dt) return undefined;
  try {
    const d = dt instanceof Date ? dt : new Date(dt);
    return d.toISOString();
  } catch {
    return undefined;
  }
}

export async function getUserById(id: number): Promise<User | null> {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, username, email, created_at FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
  const r = (rows as any[])[0];
  if (!r) return null;
  return {
    id: Number(r.id),
    username: r.username ?? "",
    email: r.email ?? null,
    createdAt: toISO(r.created_at) || new Date().toISOString(),
  };
}

export async function updateUser(
  id: number,
  patch: Partial<{
    username: string;
    email: string | null;
  }>
) {
  const pool = getPool();
  const fields: string[] = [];
  const values: any[] = [];
  for (const [k, v] of Object.entries(patch)) {
    fields.push(`${k} = ?`);
    values.push(v);
  }
  if (!fields.length) return { affectedRows: 0 } as any;
  values.push(id);
  const [res] = await pool.query(
    `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
  return res as any;
}
