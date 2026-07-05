// ponytail: smallest possible cross-app signal. Fire-and-forget POST to the storefront
// revalidate endpoint. Never resolves to a failing promise — admin save must not block on a webhook.
// Ceiling: no retry; a dropped call leaves the page stale until next deploy. Add a queue if it bites.

export async function notifyStorefront(paths: string[]): Promise<void> {
  const url = process.env.STOREFRONT_REVALIDATE_URL;
  const secret = process.env.STOREFRONT_REVALIDATE_SECRET;
  if (!url || !secret) return; // not configured → skip silently
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, path: paths }),
    });
  } catch {
    /* swallow — admin save still succeeded */
  }
}
