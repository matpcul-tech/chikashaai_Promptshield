import { NextRequest, NextResponse } from "next/server";
export const runtime = "edge";
// Direct route kept as fallback — all primary traffic goes through /api/shield
export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "Use /api/shield for all health AI requests" }, { status: 400 });
}
