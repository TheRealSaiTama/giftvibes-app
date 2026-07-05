-- ============================================================
-- Seed all storefront home-page sections into page_sections
-- so the admin "Home page" editor can edit them.
-- Uses INSERT … ON CONFLICT DO NOTHING so re-running is safe.
-- ============================================================

INSERT INTO public.page_sections (page_key, section_key, title, sort_order, enabled, content)
VALUES

-- 1. Hero
('home', 'hero', 'Hero Section', 10, true, '{
  "headline": "Custom Diaries",
  "headline_line2": "Corporate Gifts.",
  "subheading": "Crafting premium customized diaries and corporate gifts with unmatched quality.",
  "cta_text": "Explore More",
  "cta_href": "/shop",
  "background_image_url": "/headerimage5.png"
}'::jsonb),

-- 2. About / GiftVibes About
('home', 'about', 'About GiftVibes', 20, true, '{
  "heading": "GiftVibes — 25 Years of Excellence",
  "body": "We are a leading manufacturer of premium customized diaries, corporate gifts, and promotional products. With over two decades of experience, we have served 10,000+ happy clients across India.",
  "stats": [
    { "number": "25+", "label": "Years of Excellence" },
    { "number": "10K+", "label": "Happy Clients" },
    { "number": "50K+", "label": "Products Delivered" },
    { "number": "100%", "label": "Quality Assured" }
  ]
}'::jsonb),

-- 3. Best Discounts Banner
('home', 'best_discounts', 'Best Discounts Banner', 30, true, '{
  "heading": "Best Discounts",
  "subheading": "Exclusive deals on bulk orders and corporate gifting packages.",
  "cta_text": "Shop Now",
  "cta_href": "/shop"
}'::jsonb),

-- 4. Categories  (leave content empty — categories are managed separately)
('home', 'categories', 'Product Categories', 40, true, '{
  "heading": "Our Products",
  "note": "Categories are managed from the storefront categories component."
}'::jsonb),

-- 5. Best Deals / Latest Diaries
('home', 'best_deals', 'Latest Diaries Section', 50, true, '{
  "heading": "Latest 2026 Diaries",
  "items": [
    {
      "name": "Management Premium PU Leather Diary 2026",
      "description": "Magnetic flap executive diary with soft-touch PU cover and premium natural shade paper.",
      "image_url": "https://drive.google.com/uc?id=11sbS-XW7D6BsdoMYkXkINTHFsxp2NVx-",
      "min_price": 240,
      "max_price": 300,
      "href": "/shop"
    },
    {
      "name": "DIRECTORS Premium Leather Diary 2026",
      "description": "Director edition PU leather diary with sponge padding and elegant magnetic flap finish.",
      "image_url": "https://drive.google.com/uc?id=1YqUkhJ9YX33wuuJcH_qGCaAsZ0GIDNNZ",
      "min_price": 172,
      "max_price": 195,
      "href": "/shop"
    },
    {
      "name": "Heritage Leather Executive Diary 2026",
      "description": "Heritage inspired PU leather diary with foam padding and one-date-per-page layout.",
      "image_url": "https://drive.google.com/uc?id=1ntl6n5DQpoF-FkfxYO1Rs49nJHl-NWsF",
      "min_price": 137,
      "max_price": 153,
      "href": "/shop"
    },
    {
      "name": "Paipin Brown Executive Leather Diary",
      "description": "Two-tone brown magnetic flap diary crafted in soft PU with premium writing paper.",
      "image_url": "https://drive.google.com/uc?id=1lfIN2mDTjNwAMYX1xbnPBkqkl95OTuzL",
      "min_price": 154,
      "max_price": 176,
      "href": "/shop"
    }
  ]
}'::jsonb),

-- 6. Brands Section
('home', 'brands', 'Brands / Partners', 60, true, '{
  "heading": "Trusted by Leading Brands",
  "logos": []
}'::jsonb),

-- 7. Trending Diary Giftsets (Weekly Popular)
('home', 'trending_giftsets', 'Trending Diary Giftsets', 70, true, '{
  "heading": "Trending Diary Giftsets",
  "items": [
    {
      "name": "Primo A5 Corporate Diary and Pen Set",
      "description": "Soft-touch PU diary with matching metal pen and premium planner pages in an elegant gift box.",
      "image_url": "https://drive.google.com/uc?id=1UcB8Gmh4knL15Su_DsD5D0WihKEFN6pH",
      "min_price": 225,
      "max_price": 255,
      "href": "/shop"
    },
    {
      "name": "Wooden A5 Corporate Diary and Pen Set",
      "description": "Wood grain inspired diary with smooth pen, monthly planner inserts and custom branding ready box.",
      "image_url": "https://drive.google.com/uc?id=1gfUUIhJoA_fhUtO5q8cosOqV9I8fGkVV",
      "min_price": 230,
      "max_price": 250,
      "href": "/shop"
    },
    {
      "name": "Polo A5 Corporate Diary and Pen Set",
      "description": "Premium PU diary combo with elastic closure, satin ribbon and logo-ready keepsake packaging.",
      "image_url": "https://drive.google.com/uc?id=11pKAL_jh7Af3IQxxa49_MIbMXOT0tx7e",
      "min_price": 220,
      "max_price": 245,
      "href": "/shop"
    },
    {
      "name": "50-50 B5 Diary Calendar with Pen Combo Set",
      "description": "Executive B5 diary with detachable desk calendar, heavyweight pen and luxe presentation box.",
      "image_url": "https://drive.google.com/uc?id=1ZHcdURpLfDV5ZQsoXlrRjttX_d5IT_86",
      "min_price": 315,
      "max_price": 332,
      "href": "/shop"
    },
    {
      "name": "Oval Leather B5 Diary with Pen Gift Set",
      "description": "Oval motif B5 diary in plush leatherette with premium metal pen and foil-ready gift box.",
      "image_url": "https://drive.google.com/uc?id=1jIxlNwdi-E1f_-LyXT5eoP7g_JECd3JM",
      "min_price": 300,
      "max_price": 310,
      "href": "/shop"
    }
  ]
}'::jsonb),

-- 8. Cash Back / Promo Banner
('home', 'cashback_banner', 'Cashback / Promo Banner', 80, true, '{
  "heading": "Get 10% Cashback",
  "subheading": "On your first bulk order above ₹50,000. Use code GVBULK10 at checkout.",
  "cta_text": "Claim Offer",
  "cta_href": "/shop",
  "background_color": "#124559"
}'::jsonb),

-- 9. Best Deals Tabbed (Todays Best Deals — pulls from DB products)
('home', 'best_deals_tabbed', 'Today\'s Best Deals (Tabbed)', 90, true, '{
  "heading": "Todays Best Deals for you!",
  "note": "Products in this section are pulled live from the Products catalog based on their category field."
}'::jsonb),

-- 10. Why Choose Us
('home', 'why_choose_us', 'Why Choose Us', 100, true, '{
  "heading": "Why Choose GiftVibes?",
  "subheading": "Delivering excellence in every gift.",
  "features": [
    { "title": "Ethical Business Practices", "description": "Built on trust and transparency for lasting partnerships." },
    { "title": "On-Time Deliveries", "description": "Reliable shipping and delivery commitments you can count on." },
    { "title": "Reasonable Prices", "description": "Competitive pricing without compromising on quality." },
    { "title": "Custom Branding", "description": "Full customization — logos, colors, and personalization on every product." },
    { "title": "Quality Assured", "description": "Every product goes through strict quality checks before dispatch." },
    { "title": "Dedicated Support", "description": "A personal account manager for every corporate client." }
  ]
}'::jsonb),

-- 11. Customer Satisfaction
('home', 'customer_satisfaction', 'Customer Satisfaction', 110, true, '{
  "heading": "Customer Satisfaction",
  "subheading": "Trusted by thousands of businesses across India.",
  "rating": "4.9",
  "review_count": "2,400+",
  "testimonials": [
    {
      "name": "Rahul Sharma",
      "company": "Tech Corp India",
      "text": "Exceptional quality diaries with our branding. Delivered on time for our annual conference.",
      "rating": 5
    },
    {
      "name": "Priya Mehta",
      "company": "FMC Solutions",
      "text": "Best corporate gifting partner we have worked with. Premium products at great prices.",
      "rating": 5
    }
  ]
}'::jsonb),

-- 12. Cash Back Bottom Banner
('home', 'cashback_bottom', 'Bottom Promo Banner', 120, true, '{
  "heading": "Premium Corporate Gifting Made Easy",
  "subheading": "Contact us for custom quotes on bulk orders. Free samples available.",
  "cta_text": "Get a Quote",
  "cta_href": "/custom-design"
}'::jsonb),

-- 13. Services Section
('home', 'services', 'Our Services', 130, true, '{
  "heading": "Our Premium Services",
  "services": [
    {
      "title": "Custom Design Services",
      "subtitle": "Professional diary design and customization solutions",
      "image_url": "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e55b939fea169c0292_faq-min.png",
      "bg_color": "#124559"
    },
    {
      "title": "Bulk Order Solutions",
      "subtitle": "Special pricing and services for corporate orders and expertise in handling bulk orders",
      "image_url": "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e6707380718425e697_onlie%20payment-min.png",
      "bg_color": "#2c3e50"
    },
    {
      "title": "Fast Delivery",
      "subtitle": "Quick turnaround for all diary orders nationwide",
      "image_url": "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e544663ba3d0fd2bb8_home%20delivery-min.png",
      "bg_color": "#1a5d73"
    }
  ]
}'::jsonb),

-- 14. Corporate Showcase
('home', 'corporate_showcase', 'Corporate Showcase', 140, true, '{
  "heading": "Trusted by Top Corporations",
  "subheading": "Join 500+ companies who gift with GiftVibes every year.",
  "cta_text": "View Corporate Plans",
  "cta_href": "/custom-design",
  "logos": []
}'::jsonb)

ON CONFLICT (page_key, section_key) DO NOTHING;
