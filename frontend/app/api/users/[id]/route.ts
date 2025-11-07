import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser } from "@/lib/userRepo";
import { CURRENT_USER_ID } from "@/lib/config";

// GET /api/users/[id]
export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number.parseInt(idStr, 10);
  // 可选：仅允许读取当前登录用户
  if (id !== CURRENT_USER_ID) {
    // 也可选择忽略传入 id，强制读取 CURRENT_USER_ID
    // return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const row = await getUserById(id);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(row);
}

// PUT /api/users/[id]
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number.parseInt(idStr, 10);
  if (id !== CURRENT_USER_ID) {
    // 同上，简单保护
  }
  const body = await req.json().catch(() => ({} as any));
  const patch: any = {};
  if ("username" in body) patch.username = String(body.username ?? "");
  if ("email" in body) patch.email = body.email === null ? null : String(body.email ?? "");

  await updateUser(id, patch);
  const row = await getUserById(id);
  if (!row) return NextResponse.json({ error: "not found after update" }, { status: 404 });
  return NextResponse.json(row);
}
