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
            { name: 'CORPORATE GIFT SETS', subtitle: '120+ Packages Available', image: '/Giftvibes categories/CORPORATE GIFTSETS.png', bgColor: '#124559', alt: 'Professional corporate gift sets and custom diaries' },
            { name: 'NEW YEAR DIARY', subtitle: '80+ Styles Available', image: '/Giftvibes categories/NEW YEAR DIARY.png', bgColor: '#1a5d73', alt: 'Premium New Year themed diaries and planners' },
            { name: 'LEATHER GIFT ITEMS', subtitle: 'Premium Collection', image: '/Giftvibes categories/LEATHER GIFT ITEMS.png', bgColor: '#2c3e50', alt: 'High-quality leather gift items and accessories' },
            { name: 'LEATHER BAGS', subtitle: 'Executive Collection', image: '/Giftvibes categories/LEATHER BAGS.png', bgColor: '#E8923C', alt: 'Premium leather bags and accessories' },
            { name: 'JUTE BAGS', subtitle: 'Eco-Friendly Options', image: '/Giftvibes categories/JUTE BAGS.png', bgColor: '#28966E', alt: 'Sustainable jute bags for promotional use' },
            { name: 'BOTTLES GIFT SET', subtitle: 'Premium Combos', image: '/Giftvibes categories/BOTTLE GIFT SETS.png', bgColor: '#124559', alt: 'Gift sets with premium bottles and accessories' },
            { name: 'POWER BANK DIARIES', subtitle: 'Tech-Integrated', image: '/Giftvibes categories/POWERBANK DIARIES.png', bgColor: '#1a5d73', alt: 'Diaries with built-in power bank functionality' },
            { name: 'PEN STANDS', subtitle: 'Desktop Essentials', image: '/Giftvibes categories/PEN STANDS.png', bgColor: '#2c3e50', alt: 'Elegant pen stands and desk accessories' },
            { name: 'PROMOTIONAL UMBRELLAS', subtitle: 'Branded Solutions', image: '/Giftvibes categories/PROMOTIONAL UMBRELLAS.jpg', bgColor: '#8b4513', alt: 'Custom promotional umbrellas for marketing' },
            { name: 'CUSTOMISED DIARY & NOTE BOOKS', subtitle: '150+ Designs Available', image: '/Giftvibes categories/PROMOTIONAL DIARIES AND NOTEBOOKS.jpg', bgColor: '#E8923C', alt: 'Fully customized diaries and notebooks' },
            { name: 'CALENDARS', subtitle: 'Desktop & Wall Options', image: '/Giftvibes categories/CALENDARS.png', bgColor: '#28966E', alt: 'Custom table and wall calendars' },
            { name: "EXHIBITION VISITOR'S GIFT IDEAS", subtitle: 'Trade Show Specials', image: '/Giftvibes categories/EXHIBITION GIVEAWAY IDEAS.png', bgColor: '#124559', alt: 'Special gift ideas for exhibition visitors' },
          ]
        }
      },
      {
        page_key: 'home',
        section_key: 'deals',
        title: 'Best Deals',
        sort_order: 50,
        content: {
          heading: "Latest 2026 Diaries",
          items: [
            {
              name: 'Management Premium PU Leather Diary 2026',
              price: 240,
              minPrice: 240,
              maxPrice: 300,
              description: 'Magnetic flap executive diary with soft-touch PU cover and premium natural shade paper.',
              image: 'https://drive.google.com/uc?id=11sbS-XW7D6BsdoMYkXkINTHFsxp2NVx-',
            },
            {
              name: 'DIRECTORS Premium Leather Diary 2026',
              price: 172,
              minPrice: 172,
              maxPrice: 195,
              description: 'Director edition PU leather diary with sponge padding and elegant magnetic flap finish.',
              image: 'https://drive.google.com/uc?id=1YqUkhJ9YX33wuuJcH_qGCaAsZ0GIDNNZ',
            },
            {
              name: 'Heritage Leather Executive Diary 2026',
              price: 137,
              minPrice: 137,
              maxPrice: 153,
              description: 'Heritage inspired PU leather diary with foam padding and one-date-per-page layout.',
              image: 'https://drive.google.com/uc?id=1ntl6n5DQpoF-FkfxYO1Rs49nJHl-NWsF',
            },
            {
              name: 'Paipin Brown Executive Leather Diary',
              price: 154,
              minPrice: 154,
              maxPrice: 176,
              description: 'Two-tone brown magnetic flap diary crafted in soft PU with premium writing paper.',
              image: 'https://drive.google.com/uc?id=1lfIN2mDTjNwAMYX1xbnPBkqkl95OTuzL',
            },
          ]
        }
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
        title: 'Weekly Popular',
        sort_order: 70,
        content: {
          heading: "Trending Diary Giftsets",
          items: [
            {
              name: "Primo A5 Corporate Diary and Pen Set",
              price: 225,
              minPrice: 225,
              maxPrice: 255,
              description: "Soft-touch PU diary with matching metal pen and premium planner pages in an elegant gift box.",
              image: "https://drive.google.com/uc?id=1UcB8Gmh4knL15Su_DsD5D0WihKEFN6pH",
            },
            {
              name: "Wooden A5 Corporate Diary and Pen Set",
              price: 230,
              minPrice: 230,
              maxPrice: 250,
              description: "Wood grain inspired diary with smooth pen, monthly planner inserts and custom branding ready box.",
              image: "https://drive.google.com/uc?id=1gfUUIhJoA_fhUtO5q8cosOqV9I8fGkVV",
            },
            {
              name: "Polo A5 Corporate Diary and Pen Set",
              price: 220,
              minPrice: 220,
              maxPrice: 245,
              description: "Premium PU diary combo with elastic closure, satin ribbon and logo-ready keepsake packaging.",
              image: "https://drive.google.com/uc?id=11pKAL_jh7Af3IQxxa49_MIbMXOT0tx7e",
            },
            {
              name: "50-50 B5 Diary Calendar with Pen Combo Set",
              price: 315,
              minPrice: 315,
              maxPrice: 332,
              description: "Executive B5 diary with detachable desk calendar, heavyweight pen and luxe presentation box.",
              image: "https://drive.google.com/uc?id=1ZHcdURpLfDV5ZQsoXlrRjttX_d5IT_86",
            },
            {
              name: "Oval Leather B5 Diary with Pen Gift Set",
              price: 300,
              minPrice: 300,
              maxPrice: 310,
              description: "Oval motif B5 diary in plush leatherette with premium metal pen and foil-ready gift box.",
              image: "https://drive.google.com/uc?id=1jIxlNwdi-E1f_-LyXT5eoP7g_JECd3JM",
            }
          ]
        }
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
        title: 'Tabbed Products',
        sort_order: 90,
        content: {
          heading: "Todays Best Deals for you!"
        }
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

    for (const section of sections) {
      const { error } = await context.supabase
        .from('page_sections')
        .upsert(section as any, { onConflict: 'page_key, section_key' });
      if (error) throw new Error(`Error inserting ${section.section_key}: ${error.message}`);
    }

    return { ok: true };
  });

