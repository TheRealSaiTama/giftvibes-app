import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALTERS = [
  `ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_title text`,
  `ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_description text`,
  `ALTER TABLE public.products ADD COLUMN IF NOT EXISTS features jsonb NOT NULL DEFAULT '{}'::jsonb`,
  `ALTER TABLE public.diaries ADD COLUMN IF NOT EXISTS seo_title text`,
  `ALTER TABLE public.diaries ADD COLUMN IF NOT EXISTS seo_description text`,
  `ALTER TABLE public.diaries ADD COLUMN IF NOT EXISTS features jsonb NOT NULL DEFAULT '{}'::jsonb`,
];

export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "REVALIDATE_SECRET not configured" }, { status: 500 });
  }

  let body: { secret?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (body.secret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) {
    return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 500 });
  }

  const prisma = new PrismaClient({ datasources: { db: { url } } });
  const added: string[] = [];
  try {
    for (const sql of ALTERS) {
      await prisma.$executeRawUnsafe(sql);
      added.push(sql.replace(/^ALTER TABLE public\./, "").slice(0, 80));
    }
    try {
      await prisma.$executeRawUnsafe(`NOTIFY pgrst, 'reload schema'`);
    } catch (e) {
      console.warn("NOTIFY pgrst failed", e);
    }

    const cols = await prisma.$queryRawUnsafe<Array<{ table_name: string; column_name: string }>>(
      `SELECT table_name, column_name FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name IN ('products', 'diaries')
       ORDER BY table_name, ordinal_position`,
    );

    return NextResponse.json({
      ok: true,
      added,
      columns: cols.map((c) => `${c.table_name}.${c.column_name}`),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Repair failed";
    console.error("repair-catalog-schema", e);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
