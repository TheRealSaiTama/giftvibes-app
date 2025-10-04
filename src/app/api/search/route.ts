import { NextRequest, NextResponse } from "next/server";
import { getPriceOverride } from "@/lib/price-overrides";
import { diaryCsvFiles } from "@/lib/diary-csv";

interface SearchResult {
  id: number;
  name: string;
  description?: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  imageUrl: string;
  category?: string | null;
  source: "diary" | "product";
  path: string;
}

const DRIVE_REGEX = /\/d\/([A-Za-z0-9_-]+)/;
const DRIVE_QUERY_REGEX = /[?&]id=([A-Za-z0-9_-]+)/;

function resolveImageUrl(url: string | null | undefined): string {
  if (!url) {
    return "";
  }

  if (url.includes("drive.google.com")) {
    const match = url.match(DRIVE_REGEX) || url.match(DRIVE_QUERY_REGEX);
    if (match && match[1]) {
      return `https://drive.google.com/uc?id=${match[1]}`;
    }
  }

  return url;
}

function matchesQuery(value: string | null | undefined, query: string): boolean {
  if (!value) return false;
  return value.toLowerCase().includes(query);
}

async function searchDiaries(query: string, limit: number): Promise<SearchResult[]> {
  const fs = await import("fs");
  const { parse } = await import("csv-parse/sync");

  const results: SearchResult[] = [];
  let idCounter = 100000;
  const queue: Array<() => SearchResult | null> = [];

  for (const file of diaryCsvFiles) {
    try {
      const csvData = fs.readFileSync(file.path, "utf-8");
      const records = parse(csvData, {
        columns: true,
        skip_empty_lines: true,
      }) as Record<string, string>[];

      for (const record of records) {
        const diaryId = idCounter++;
        queue.push(() => {
          const name = record["Product Name"];
          if (!matchesQuery(name, query) &&
              !matchesQuery(record["Tags"], query) &&
              !matchesQuery(record["Categories"], query)) {
            return null;
          }

          const priceText = record["Price Range"] || "";
          const prices = priceText.match(/\d+/g)?.map(Number) || [];
          const minPriceRaw = prices[0];
          const maxPriceRaw = prices.length > 1 ? prices[prices.length - 1] : prices[0];
          const override = getPriceOverride(name);

          return {
            id: diaryId,
            name,
            description: record["Short Description"] ?? "",
            minPrice: override?.minPrice ?? (typeof minPriceRaw === "number" ? minPriceRaw : null),
            maxPrice: override?.maxPrice ?? (typeof maxPriceRaw === "number" ? maxPriceRaw : null),
            imageUrl: resolveImageUrl(record["Product image"]),
            category: record["Categories"],
            source: "diary" as const,
            path: `/shop/${diaryId}`,
          } satisfies SearchResult;
        });
      }
    } catch (error) {
      console.error("Error searching diary CSV", { file: file.name, error });
    }
  }

  // Breadth-first traversal over the queued diary items for responsive ordering
  while (queue.length > 0 && results.length < limit) {
    const resolver = queue.shift();
    if (!resolver) {
      continue;
    }
    const item = resolver();
    if (item) {
      results.push(item);
    }
  }

  return results;
}

async function searchDatabaseProducts(query: string, limit: number): Promise<SearchResult[]> {
  const { prisma } = await import("@/lib/prisma");

  const matches = await prisma.product.findMany({
    where: {
      name: { contains: query, mode: "insensitive" },
    },
    take: limit,
  });

  return matches.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    minPrice: product.minPrice ?? null,
    maxPrice: product.maxPrice ?? null,
    imageUrl: resolveImageUrl(product.imageUrl ?? ""),
    category: product.category,
    source: "product" as const,
    path: `/shop/${product.id}`,
  }));
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const rawQuery = url.searchParams.get("q") ?? "";
    const query = rawQuery.trim().toLowerCase();

    if (!query) {
      return NextResponse.json({ results: [] }, { headers: { "Cache-Control": "no-store" } });
    }

    const [diaries, products] = await Promise.all([
      searchDiaries(query, 7),
      searchDatabaseProducts(query, 5),
    ]);

    const combined: SearchResult[] = [...diaries];

    for (const item of products) {
      if (combined.length >= 10) break;
      combined.push(item);
    }

    return NextResponse.json(
      { results: combined },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Search API error", error);
    return NextResponse.json(
      { results: [], error: "SEARCH_FAILED" },
      { status: 500 }
    );
  }
}
