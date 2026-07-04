// Storefront API Client
const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:5174";

class ApiError extends Error { status: number; constructor(m: string, s: number) { super(m); this.name = "ApiError"; this.status = s; } }

async function fetchJson<T>(ep: string): Promise<T> { const r = await fetch(ADMIN_API_URL + ep, { next: { revalidate: 60 } }); if (!r.ok) throw new ApiError("API " + r.status, r.status); return r.json() as Promise<T>; }

export async function getProducts(params?: { category?: string; featured?: string; limit?: number }): Promise<any[]> { const sp = new URLSearchParams(); if (params?.category) sp.set("category", params.category); if (params?.featured) sp.set("featured", params.featured); if (params?.limit) sp.set("limit", String(params.limit)); const qs = sp.toString(); return fetchJson("/api/public/products" + (qs ? "?" + qs : "")); }

export async function getProductBySlug(slug: string): Promise<any | null> { try { return await fetchJson("/api/public/products/" + encodeURIComponent(slug)); } catch (e) { if (e instanceof ApiError && e.status === 404) return null; throw e; } }

export async function getDiaries(): Promise<any[]> { return fetchJson("/api/public/diaries"); }

export async function getPageContent(pageKey: string): Promise<any | null> { try { return await fetchJson("/api/public/content/page/" + encodeURIComponent(pageKey)); } catch (e) { if (e instanceof ApiError && (e.status === 404 || e.status === 204)) return null; throw e; } }

export async function getNavLinks(): Promise<any[]> { return fetchJson("/api/public/content/nav"); }

export async function getSiteSettings(): Promise<any | null> { try { return await fetchJson("/api/public/content/site-settings"); } catch (e) { if (e instanceof ApiError && e.status === 404) return null; throw e; } }
