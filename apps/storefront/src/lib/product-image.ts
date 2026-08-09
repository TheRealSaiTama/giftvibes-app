/**
 * Resolve product/diary image URLs for next/image.
 * - Never use the square brand logo as a product photo (it looks like white padding).
 * - Google Drive share/uc links → thumbnail URL that actually loads in the browser.
 */

/** Neutral product placeholder (not the brand mark). */
export const PRODUCT_IMAGE_PLACEHOLDER = "/diary/trendingdiary.png";

/** Compact header/footer brand mark (wide crop, not the 2048² square). */
export const BRAND_LOGO_COMPACT = "/logo3.png";

export function extractGoogleDriveFileId(url: string): string | null {
  const s = String(url || "").trim();
  if (!s) return null;
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]{20,})/,
    /\/d\/([a-zA-Z0-9_-]{20,})/,
    /[?&]id=([a-zA-Z0-9_-]{20,})/,
    /^([a-zA-Z0-9_-]{25,})$/,
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

/**
 * Prefer reliable Drive thumbnail; keep http(s) and site-relative paths;
 * never return empty string (next/image throws).
 */
export function resolveProductImage(raw: string | null | undefined): string {
  const url = String(raw || "").trim();
  if (!url) return PRODUCT_IMAGE_PLACEHOLDER;

  // Brand logo was wrongly used as product fallback — treat as missing.
  if (
    url === "/logo.png" ||
    url.endsWith("/logo.png") ||
    url === "/logo3.png" ||
    url.endsWith("/logo3.png")
  ) {
    return PRODUCT_IMAGE_PLACEHOLDER;
  }

  const driveId = extractGoogleDriveFileId(url);
  if (driveId) {
    // thumbnail endpoint serves actual images for publicly shared Drive files.
    // uc?id= often returns an HTML interstitial that next/image cannot display.
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`;
  }

  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
    return url;
  }

  return PRODUCT_IMAGE_PLACEHOLDER;
}

export function isRemoteOrDataImage(url: string): boolean {
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.includes("drive.google.com") ||
    url.includes("googleusercontent.com")
  );
}
