export const LIVE_SITE = "https://www.giftvibes.in";

/** Repair giftvibe.in (missing s) and empty values. */
export function normalizeGiftvibesUrl(raw: string | null | undefined): string {
  const t = (raw || "").trim();
  if (!t) return LIVE_SITE;
  try {
    const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`;
    const u = new URL(withProto);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "giftvibe.in" || host === "giftvibe.com") return LIVE_SITE;
    if (host === "giftvibes.in") return LIVE_SITE;
    return `${u.protocol}//${u.host}`.replace(/\/+$/, "");
  } catch {
    return LIVE_SITE;
  }
}
