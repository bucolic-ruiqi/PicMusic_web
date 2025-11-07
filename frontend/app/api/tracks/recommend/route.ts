// Deprecated: This endpoint has been removed. Frontend now calls FastAPI directly.
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ error: "/api/tracks/recommend has been removed. Use backend /recommend instead." }, { status: 410 });
}
