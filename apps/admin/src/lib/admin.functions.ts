import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { notifyStorefront } from "@/lib/revalidate";

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
    await notifyStorefront(["/", "/shop"]);
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
    await notifyStorefront(["/", "/shop"]);
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
    await notifyStorefront(["/"]);
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
    await notifyStorefront([data.page_key === "home" ? "/" : `/${data.page_key}`]);
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
    await notifyStorefront(["/"]);
    return { ok: true };
  });

// -------- PRODUCTS --------
const productShape = z.object({
  slug: z.string().min(1).regex(/^[A-Za-z0-9-_]+$/, "letters, digits, dashes and underscores only"),
  name: z.string().min(1),
  description: z.string().nullable(),
  min_price: z.number().int().nullable(),
  max_price: z.number().int().nullable(),
  category: z.string().nullable(),
  tags: z.array(z.string()),
  image_url: z.string().nullable(),
  featured: z.boolean(),
  enabled: z.boolean(),
  // M6: secondary images stored as a JSON array of URLs in the existing `gallery` column.
  gallery: z.array(z.string()).default([]),
  // M8: per-feature { show, value }. Only enabled + non-empty values render on the product page.
  features: z.record(z.object({ show: z.boolean(), value: z.string() })).default({}),
  // M9: SEO meta. Used by storefront generateMetadata.
  seo_title: z.string().nullable(),
  seo_description: z.string().nullable(),
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
      await notifyStorefront(["/", "/shop", `/shop/${data.id}`, `/shop/${data.values.slug}`]);
      return { ok: true, id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("products")
      .insert(data.values)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await notifyStorefront(["/", "/shop", `/shop/${row.id}`]);
    return { ok: true, id: row.id };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await notifyStorefront(["/", "/shop", `/shop/${data.id}`]);
    return { ok: true };
  });

// -------- DIARIES --------
const diaryShape = z.object({
  slug: z.string().min(1).regex(/^[A-Za-z0-9-_]+$/),
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
  gallery: z.array(z.string()).default([]),
  features: z.record(z.object({ show: z.boolean(), value: z.string() })).default({}),
  seo_title: z.string().nullable(),
  seo_description: z.string().nullable(),
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
      await notifyStorefront(["/", "/shop", `/shop/${data.id}`, `/shop/${data.values.slug}`]);
      return { ok: true, id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("diaries")
      .insert(data.values)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await notifyStorefront(["/", "/shop", `/shop/${row.id}`]);
    return { ok: true, id: row.id };
  });

export const deleteDiary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("diaries").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await notifyStorefront(["/", "/shop", `/shop/${data.id}`]);
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

// -------- STORAGE SETUP --------
export const ensureSiteMediaBucket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = buckets?.some((b) => b.id === "site-media");
    if (!exists) {
      const { error } = await supabaseAdmin.storage.createBucket("site-media", {
        public: true,
        fileSizeLimit: 52428800,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif"],
      });
      if (error && !error.message.includes("already exists")) throw new Error(error.message);
    }
    return { ok: true };
  });

// -------- SEED --------
export const seedHomeSections = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sections = [
      {
        page_key: 'home',
        section_key: 'hero',
        title: 'Hero Section',
        sort_order: 10,
        content: {
          heading_1: "Custom Diaries",
          heading_2: "Corporate Gifts.",
          subheading_1: "Crafting premium customized diaries and",
          subheading_2: "corporate gifts with unmatched quality.",
          primary_cta: {
            base_text: "Come Here",
            hover_text: "Explore More",
            url: "/shop"
          },
          background_image_url: "/headerimage5.png"
        }
      },
      {
        page_key: 'home',
        section_key: 'about',
        title: 'About Section',
        sort_order: 20,
        content: {
          heading_1: "Our Journey of",
          heading_highlight: "Excellence",
          paragraph_1: "Incorporated in 1999, Ravindra Enterprises stands as one of the industry's most trusted names in manufacturing and exporting premium Corporate Diaries and Gifts. From our state-of-the-art facilities, we deliver excellence to clients worldwide.",
          paragraph_2: "Our comprehensive range includes Desk Calendars, Art Cover Diaries, Corporate Diaries, Executive Planners, Promotional Pens, and specialized diaries for professionals. Each product reflects our commitment to quality and innovation.",
          paragraph_3: "Under the visionary leadership of our Founders, we've established ourselves as industry leaders through client-centered approaches and unwavering dedication to excellence.",
          image_url: "/about.png",
          stats: [
            { number: "25+", label: "Years of Excellence" },
            { number: "10K+", label: "Happy Clients" },
            { number: "50K+", label: "Products Delivered" },
            { number: "100%", label: "Quality Assured" }
          ]
        }
      },
      {
        page_key: 'home',
        section_key: 'discounts',
        title: 'Discounts Banner',
        sort_order: 30,
        content: {
          text_1: "BEST DISCOUNTS",
          text_2: "ONLY WHOLESALE"
        }
      },
      {
        page_key: 'home',
        section_key: 'categories',
        title: 'Categories',
        sort_order: 40,
        content: {
          heading: "Our Products",
          items: [
            { name: 'CORPORATE GIFT SETS', subtitle: '120+ Packages Available', image_url: '/Giftvibes categories/CORPORATE GIFTSETS.png', bgColor: '#124559', alt: 'Professional corporate gift sets and custom diaries', href: '', sort_order: 1 },
            { name: 'NEW YEAR DIARY', subtitle: '80+ Styles Available', image_url: '/Giftvibes categories/NEW YEAR DIARY.png', bgColor: '#1a5d73', alt: 'Premium New Year themed diaries and planners', href: '', sort_order: 2 },
            { name: 'LEATHER GIFT ITEMS', subtitle: 'Premium Collection', image_url: '/Giftvibes categories/LEATHER GIFT ITEMS.png', bgColor: '#2c3e50', alt: 'High-quality leather gift items and accessories', href: '', sort_order: 3 },
            { name: 'LEATHER BAGS', subtitle: 'Executive Collection', image_url: '/Giftvibes categories/LEATHER BAGS.png', bgColor: '#E8923C', alt: 'Premium leather bags and accessories', href: '', sort_order: 4 },
            { name: 'JUTE BAGS', subtitle: 'Eco-Friendly Options', image_url: '/Giftvibes categories/JUTE BAGS.png', bgColor: '#28966E', alt: 'Sustainable jute bags for promotional use', href: '', sort_order: 5 },
            { name: 'BOTTLES GIFT SET', subtitle: 'Premium Combos', image_url: '/Giftvibes categories/BOTTLE GIFT SETS.png', bgColor: '#124559', alt: 'Gift sets with premium bottles and accessories', href: '', sort_order: 6 },
            { name: 'POWER BANK DIARIES', subtitle: 'Tech-Integrated', image_url: '/Giftvibes categories/POWERBANK DIARIES.png', bgColor: '#1a5d73', alt: 'Diaries with built-in power bank functionality', href: '', sort_order: 7 },
            { name: 'PEN STANDS', subtitle: 'Desktop Essentials', image_url: '/Giftvibes categories/PEN STANDS.png', bgColor: '#2c3e50', alt: 'Elegant pen stands and desk accessories', href: '', sort_order: 8 },
            { name: 'PROMOTIONAL UMBRELLAS', subtitle: 'Branded Solutions', image_url: '/Giftvibes categories/PROMOTIONAL UMBRELLAS.jpg', bgColor: '#8b4513', alt: 'Custom promotional umbrellas for marketing', href: '', sort_order: 9 },
            { name: 'CUSTOMISED DIARY & NOTE BOOKS', subtitle: '150+ Designs Available', image_url: '/Giftvibes categories/PROMOTIONAL DIARIES AND NOTEBOOKS.jpg', bgColor: '#E8923C', alt: 'Fully customized diaries and notebooks', href: '', sort_order: 10 },
            { name: 'CALENDARS', subtitle: 'Desktop & Wall Options', image_url: '/Giftvibes categories/CALENDARS.png', bgColor: '#28966E', alt: 'Custom table and wall calendars', href: '', sort_order: 11 },
            { name: "EXHIBITION VISITOR'S GIFT IDEAS", subtitle: 'Trade Show Specials', image_url: '/Giftvibes categories/EXHIBITION GIVEAWAY IDEAS.png', bgColor: '#124559', alt: 'Special gift ideas for exhibition visitors', href: '', sort_order: 12 },
          ]
        }
      },
      {
        page_key: 'home',
        section_key: 'best_deals',
        title: 'Latest Diaries Section',
        sort_order: 50,
        content: {
          heading: "Latest 2026 Diaries",
          // Admin picks up to 4 catalog IDs via ProductPicker; empty → storefront defaults.
          items: [] as { productId: string }[],
        },
      },
      {
        page_key: 'home',
        section_key: 'brands',
        title: 'Brands Marquee',
        sort_order: 60,
        content: {
          heading: "Trusted by Leading Brands",
          items: [
            { name: 'Brand 1', logo: '/brand/image_2025-09-23_00-54-08.png' },
            { name: 'Brand 2', logo: '/brand/image_2025-09-23_00-54-22.png' },
            { name: 'Brand 3', logo: '/brand/image_2025-09-23_00-55-13.png' },
            { name: 'Brand 4', logo: '/brand/image_2025-09-23_00-55-35.png' },
            { name: 'Brand 5', logo: '/brand/image_2025-09-23_00-55-50.png' },
            { name: 'Brand 6', logo: '/brand/image_2025-09-23_00-56-12.png' },
            { name: 'Brand 7', logo: '/brand/image_2025-09-23_00-56-33.png' },
          ]
        }
      },
      {
        page_key: 'home',
        section_key: 'popular',
        title: 'Trending Diary Giftsets',
        sort_order: 70,
        content: {
          heading: "Trending Diary Giftsets",
          // Admin picks up to 5 catalog IDs via ProductPicker; empty → storefront defaults.
          items: [] as { productId: string }[],
        },
      },
      {
        page_key: 'home',
        section_key: 'cashback',
        title: 'Cashback / Promo',
        sort_order: 80,
        content: {
          heading: "Corporate Diaries & Premium Gift Sets from GiftVibes.in",
          description: "From logo‑embossed planners to curated gift combos, We help promote your brand that leaves a long lasting impression on your clients and builds a sense of trust among your employees. Customised Diaries, Customised Notebooks, Customised Gifts, Executive Diaries, Leather Diaries and Gift sets at best price.   delivered on time.",
          cta: {
            text: "Learn More",
            url: "/shop"
          },
          image_url: "/removebg2.png"
        }
      },
      {
        page_key: 'home',
        section_key: 'tabbed_products',
        title: "Today's Best Deals",
        sort_order: 90,
        content: {
          heading: "Todays Best Deals for you!",
          // Admin creates named tabs; each tab holds up to 8 productIds.
          tabs: [] as { name: string; productIds: string[] }[],
        },
      },
      {
        page_key: 'home',
        section_key: 'why_choose_us',
        title: 'Why Choose Us',
        sort_order: 100,
        content: {
          heading: "Why Choose Us?",
          subheading: "We are more than just a Diary Manufacturers; we are your partners in success. Here’s why discerning clients choose Ravindra Enterprises.",
          features: [
            {
              title: "Ethical Business Practices",
              description: "Built on trust and transparency for lasting partnerships."
            },
            {
              title: "On-Time Deliveries",
              description: "Reliable shipping and delivery commitments you can count on."
            },
            {
              title: "Reasonable Prices",
              description: "Competitive pricing without compromising on quality."
            },
            {
              title: "High-Grade Product Range",
              description: "Premium quality products that exceed expectations."
            },
            {
              title: "Customized Printing",
              description: "We are serving with out expertise in various printing methods like Logo Emboss Printing, Customised Cover Printing, Logo on Each Page, Hot Foil Printing, Engraving Printing and Laser Printing. "
            },
            {
              title: "PAN India Deliveries",
              description: "Extensive reach across nationwide markets and beyond."
            }
          ]
        }
      },
      {
        page_key: 'home',
        section_key: 'satisfaction',
        title: 'Customer Satisfaction',
        sort_order: 110,
        content: {
          heading: "Customer Satisfaction",
          description: "Our commitment to excellence drives us to exceed expectations at every step. With our extensive merchant network and quality-first approach, we ensure every product meets global standards while satisfying the diverse needs of our valued clients.",
          cta: {
            text: "Experience Excellence Today"
          }
        }
      },
      {
        page_key: 'home',
        section_key: 'cashback_bottom',
        title: 'Cashback Bottom',
        sort_order: 120,
        content: {
          heading_1: "Customised Diaries and Note Books",
          heading_2: "Customised Corporate Gifts at Best price",
          image_url: "/footer1.png",
          cta: {
            text: "Learn More",
            url: "/custom-design"
          }
        }
      },
      {
        page_key: 'home',
        section_key: 'services',
        title: 'Services',
        sort_order: 130,
        content: {
          heading: "Our Premium Services",
          services: [
            {
              title: "Custom Design Services",
              subtitle: "Professional diary design and customization solutions",
              image: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e55b939fea169c0292_faq-min.png",
              bgColorClass: "#124559",
            },
            {
              title: "Bulk Order Solutions",
              subtitle: "Special pricing and services for corporate orders and expertise in handling bulk order",
              image: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e6707380718425e697_onlie%20payment-min.png",
              bgColorClass: "#2c3e50",
            },
            {
              title: "Fast Delivery",
              subtitle: "Quick turnaround for all diary orders nationwide",
              image: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e544663ba3d0fd2bb8_home%20delivery-min.png",
              bgColorClass: "#1a5d73",
            }
          ]
        }
      },
      {
        page_key: 'home',
        section_key: 'corporate_showcase',
        title: 'Corporate Showcase',
        sort_order: 140,
        content: {
          badge: "GiftVibes.in Excellence Since 1999",
          heading: "Crafting Premium Diaries & Corporate Gifts at Wholesale Value",
          description: "GiftVibes.in is a trusted diary manufacturer in Delhi delivering promotional products directly from the source. Enjoy wholesale pricing without middlemen while our team personalizes each piece to suit your brand.",
          features: [
            {
              title: "25+ Years of Mastery",
              description: "One of India's largest calendar & diary exporters, maintaining impeccable quality across every order."
            },
            {
              title: "Tailored Corporate Gifting",
              description: "We customise products to match brand guidelines, simplifying corporate & promotional gifting campaigns."
            },
            {
              title: "Global Confidence",
              description: "Our expansive collection, timely delivery, and expert support make us the preferred partner for brands worldwide."
            }
          ],
          highlights_title: "Signature Corporate Offerings",
          highlights_desc: "Discover a comprehensive range designed to suit every corporate milestone and brand moment.",
          highlights: [
            "2026 Diaries & Planners",
            "Promotional Customized Diaries",
            "Business Organizers",
            "PU Leather Diaries",
            "Executive Diaries",
            "Corporate Gift Sets",
            "Customized Notepads & Notebooks",
            "Promotional Pens & Calendars",
            "Keychains & Desktop Gifts",
            "Employee Joining Kits",
            "2-in-1 & 3-in-1 Gift Sets"
          ],
          solutions_title: "360° Marketing Support",
          solutions_desc: "Partner with us for marketing collateral that keeps your brand memorable long after every gifting moment.",
          solutions: [
            "Office Diaries & Leather Planners",
            "Sticky Notes & Notepads",
            "Customized Gift Sets & Notebooks",
            "Pharma Gifts & Marketing Materials",
            "Key Chains & Wooden Pen Stands",
            "Seasonal Gifts (Diwali, New Year)",
            "Promotional Pens",
            "Umbrellas"
          ],
          disclaimer: "Disclaimer: All trademarks, logos, and brand names referenced remain the property of their respective owners."
        }
      }
    ];

    // Only INSERT missing sections — never overwrite content the user already edited.
    const { data: existing, error: listErr } = await context.supabase
      .from("page_sections")
      .select("section_key, content")
      .eq("page_key", "home");
    if (listErr) throw new Error(listErr.message);

    const existingKeys = new Set((existing || []).map((r: any) => r.section_key as string));
    let inserted = 0;

    for (const section of sections) {
      if (existingKeys.has(section.section_key)) continue;
      const { error } = await context.supabase.from("page_sections").insert(section as any);
      if (error) throw new Error(`Error inserting ${section.section_key}: ${error.message}`);
      inserted++;
    }

    // Repair broken hero rows that only have a single "headline" field (old/partial seed).
    const heroRow = (existing || []).find((r: any) => r.section_key === "hero");
    if (heroRow && heroRow.content && typeof heroRow.content === "object") {
      const c = heroRow.content as Record<string, any>;
      if (!c.heading_1 && (c.headline || c.heading)) {
        const repaired = {
          heading_1: c.headline || c.heading || "Custom Diaries",
          heading_2: c.headline_line2 || c.heading_2 || "Corporate Gifts.",
          subheading_1:
            typeof c.subheading === "string"
              ? c.subheading
              : c.subheading_1 || "Crafting premium customized diaries and",
          subheading_2: c.subheading_2 || "corporate gifts with unmatched quality.",
          primary_cta: c.primary_cta || {
            base_text: c.cta_text || "Come Here",
            hover_text: "Explore More",
            url: c.cta_href || "/shop",
          },
          background_image_url: c.background_image_url || "/headerimage5.png",
        };
        const { error } = await context.supabase
          .from("page_sections")
          .update({ content: repaired, title: "Hero Section" })
          .eq("page_key", "home")
          .eq("section_key", "hero");
        if (error) throw new Error(`Error repairing hero: ${error.message}`);
      }
    }

    // Shop + product template pages (so admin isn't empty)
    const extraPages = [
      {
        page_key: "shop",
        section_key: "main",
        title: "Shop page",
        sort_order: 10,
        content: {
          heading: "Our Products",
          subheading: "Browse diaries, gift sets, and corporate essentials.",
          empty_state: "No products match your filters. Try clearing filters.",
        },
      },
      {
        page_key: "product",
        section_key: "main",
        title: "Product template",
        sort_order: 10,
        content: {
          related_heading: "You may also like",
          enquiry_cta: "Enquire Now",
          quote_cta: "Request Quote",
        },
      },
    ];

    for (const section of extraPages) {
      const { data: row } = await context.supabase
        .from("page_sections")
        .select("id")
        .eq("page_key", section.page_key)
        .eq("section_key", section.section_key)
        .maybeSingle();
      if (row) continue;
      const { error } = await context.supabase.from("page_sections").insert(section as any);
      if (error) throw new Error(`Error inserting ${section.page_key}/${section.section_key}: ${error.message}`);
      inserted++;
    }

    await notifyStorefront(["/", "/shop"]);
    return { ok: true, inserted, totalHome: sections.length };
  });

