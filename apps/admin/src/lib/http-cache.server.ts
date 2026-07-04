// Shared caching helpers for public GET endpoints.
// Computes a weak ETag from the body and honors If-None-Match / If-Modified-Since.

async function sha1Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-1", buf);
  const bytes = new Uint8Array(digest);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, "0");
  return hex;
}

export function pickLatest(dates: Array<string | null | undefined>): Date {
  let max = 0;
  for (const d of dates) {
    if (!d) continue;
    const t = new Date(d).getTime();
    if (Number.isFinite(t) && t > max) max = t;
  }
  return max > 0 ? new Date(max) : new Date();
}

export async function cachedResponse(opts: {
  request: Request;
  body: string;
  contentType: string;
  lastModified: Date;
  /** browser cache seconds */
  maxAge?: number;
  /** shared/CDN cache seconds */
  sMaxAge?: number;
  /** stale-while-revalidate seconds */
  swr?: number;
}): Promise<Response> {
  const {
    request,
    body,
    contentType,
    lastModified,
    maxAge = 300,
    sMaxAge = 600,
    swr = 3600,
  } = opts;

  const hash = await sha1Hex(body);
  const etag = `W/"${hash}-${lastModified.getTime().toString(36)}"`;
  const lastModifiedHttp = lastModified.toUTCString();

  const headers = new Headers({
    "Content-Type": contentType,
    "Cache-Control": `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=${swr}`,
    "Access-Control-Allow-Origin": "*",
    ETag: etag,
    "Last-Modified": lastModifiedHttp,
    Vary: "Accept-Encoding",
  });

  // Conditional GET handling
  const ifNoneMatch = request.headers.get("if-none-match");
  const ifModifiedSince = request.headers.get("if-modified-since");

  const etagMatches =
    ifNoneMatch != null &&
    ifNoneMatch
      .split(",")
      .map((v) => v.trim())
      .some((v) => v === etag || v === `"${hash}"` || v === "*");

  const notModifiedSince =
    ifModifiedSince != null &&
    !Number.isNaN(Date.parse(ifModifiedSince)) &&
    Date.parse(ifModifiedSince) >= Math.floor(lastModified.getTime() / 1000) * 1000;

  if (etagMatches || (!ifNoneMatch && notModifiedSince)) {
    return new Response(null, { status: 304, headers });
  }

  return new Response(body, { status: 200, headers });
}
