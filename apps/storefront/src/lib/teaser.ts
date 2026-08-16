/**
 * Short home-card copy. Catalog descriptions are long (highlights + specs +
 * COD notes). Cards used to show one short line.
 */
export function teaserDescription(raw: string | null | undefined, maxChars = 110): string {
  let s = String(raw || "").replace(/\s+/g, " ").trim();
  if (!s) return "";
  s = s.replace(/^product highlights\s*/i, "").trim();
  // Drop spec / policy tails that explode card height.
  s = s.split(/\b(?:Size\s*:|Diary Size\s*:|Binding\s*:|Page Format\s*:|Cover Binding\s*:|COD facility)/i)[0].trim();
  const sentence = (s.match(/^(.+?[.!?])(?:\s|$)/) || [])[1] || s;
  const base = sentence.length >= 24 && sentence.length <= maxChars ? sentence : s;
  if (base.length <= maxChars) return base.replace(/[“”"']+$/g, "").trim();
  return `${base.slice(0, maxChars).replace(/\s+\S*$/, "").trim()}…`;
}
