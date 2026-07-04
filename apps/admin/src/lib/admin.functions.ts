import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * All admin write server functions.
 * They rely on `requireSupabaseAuth` middleware + Postgres RLS (is_owner())
 * so only the actual owner can mutate anything.
 */

// -------- SECTIONS --------
export const updateSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        title: z.string().optional().nullable(),
        content: z.record(z.string(), z.any()),
        enabled: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("page_sections")
      .update({
        title: data.title ?? null,
        content: data.content,
        ...(data.enabled !== undefined ? { enabled: data.enabled } : {}),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reorderSections = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        pageKey: z.string(),
        ordered: z.array(z.object({ id: z.string().uuid(), sort_order: z.number().int() })),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    for (const row of data.ordered) {
      const { error } = await context.supabase
        .from("page_sections")
        .update({ sort_order: row.sort_order })
        .eq("id", row.id)
        .eq("page_key", data.pageKey);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// -------- SETTINGS --------
export const updateSiteSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        brand_name: z.string().min(1),
        tagline: z.string().nullable(),
        logo_url: z.string().nullable(),
        favicon_url: z.string().nullable(),
        primary_color: z.string().nullable(),
        whatsapp_number: z.string().nullable(),
        phone: z.string().nullable(),
        email: z.string().nullable(),
        address: z.string().nullable(),
        site_url: z.string().nullable(),
        preview_url: z.string().nullable(),
        socials: z.record(z.string(), z.string()),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("site_settings").update(data).eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// -------- SEO --------
export const upsertSeo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        page_key: z.string(),
        title: z.string().nullable(),
        description: z.string().nullable(),
        og_image_url: z.string().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("page_seo").upsert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// -------- NAV --------
const navLinkShape = z.object({
  id: z.string().uuid().optional(),
  group_key: z.string(),
  label: z.string().min(1),
  href: z.string().min(1),
  sort_order: z.number().int(),
  enabled: z.boolean(),
});

export const saveNavLinks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        group_key: z.string(),
        links: z.array(navLinkShape),
        deleted_ids: z.array(z.string().uuid()).default([]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    if (data.deleted_ids.length) {
      const { error } = await context.supabase.from("nav_links").delete().in("id", data.deleted_ids);
      if (error) throw new Error(error.message);
    }
    for (const link of data.links) {
      if (link.id) {
        const { error } = await context.supabase.from("nav_links").update({
          label: link.label,
          href: link.href,
          sort_order: link.sort_order,
          enabled: link.enabled,
        }).eq("id", link.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await context.supabase.from("nav_links").insert({
          group_key: data.group_key,
          label: link.label,
          href: link.href,
          sort_order: link.sort_order,
          enabled: link.enabled,
        });
        if (error) throw new Error(error.message);
      }
    }
    return { ok: true };
  });

// -------- PRODUCTS --------
const productShape = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "lowercase letters, digits and dashes only"),
  name: z.string().min(1),
  description: z.string().nullable(),
  min_price: z.number().int().nullable(),
  max_price: z.number().int().nullable(),
  category: z.string().nullable(),
  tags: z.array(z.string()),
  image_url: z.string().nullable(),
  featured: z.boolean(),
  enabled: z.boolean(),
});

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ id: z.string().uuid().optional(), values: productShape }).parse(d),
  )
  .handler(async ({ data, context }) => {
    if (data.id) {
      const { error } = await context.supabase.from("products").update(data.values).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("products")
      .insert(data.values)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// -------- DIARIES --------
const diaryShape = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string().nullable(),
  min_price: z.number().int().nullable(),
  max_price: z.number().int().nullable(),
  category: z.string().nullable(),
  tags: z.array(z.string()),
  color: z.string().nullable(),
  size: z.string().nullable(),
  pages: z.number().int().nullable(),
  cover_type: z.string().nullable(),
  image_url: z.string().nullable(),
  featured: z.boolean(),
  enabled: z.boolean(),
});

export const saveDiary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ id: z.string().uuid().optional(), values: diaryShape }).parse(d),
  )
  .handler(async ({ data, context }) => {
    if (data.id) {
      const { error } = await context.supabase.from("diaries").update(data.values).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("diaries")
      .insert(data.values)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });

export const deleteDiary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("diaries").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// -------- MEDIA --------
export const registerMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        path: z.string(),
        url: z.string(),
        alt: z.string().nullable(),
        mime_type: z.string().nullable(),
        size_bytes: z.number().int().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("media_assets").insert({
      path: data.path,
      url: data.url,
      alt: data.alt,
      mime_type: data.mime_type,
      size_bytes: data.size_bytes,
      uploaded_by: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), path: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    await context.supabase.storage.from("site-media").remove([data.path]);
    const { error } = await context.supabase.from("media_assets").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
