import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// ponytail: fire-and-forget on-demand revalidation. Admin calls this after a save
// so storefront pages pick up DB changes without a manual Vercel redeploy.
// Secret-gated; if it leaks the worst case is excess revalidation, never data exposure.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "REVALIDATE_SECRET not configured" }, { status: 500 });
  }

  let body: { secret?: string; path?: string | string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.secret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const paths = Array.isArray(body.path) ? body.path : body.path ? [body.path] : [];
  if (paths.length === 0) {
    return NextResponse.json({ error: "Missing 'path'" }, { status: 400 });
  }

  for (const p of paths) {
    try {
      revalidatePath(p);
    } catch {
      /* ignore unknown paths */
    }
  }

  return NextResponse.json({ revalidated: true, paths });
}

export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "POST /api/revalidate" });
}
