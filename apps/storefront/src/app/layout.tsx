import * as React from "react";
import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import WhatsAppButton from "@/components/WhatsAppButton";
import Script from "next/script";
import { Toaster } from "sonner";
import { ProductProvider } from '@/context/ProductContext';
import { getSettings, getSeo } from "@/lib/site";
import { normalizePublicSiteUrl } from "@/lib/cms/mappers";
import { organizationJsonLd } from "@/lib/seo";

// ponytail: metadata now comes from admin's site_settings + page_seo (home) with the previous
// hardcoded values as fallback. DB down → site still ships SEO.

export async function generateMetadata(): Promise<Metadata> {
  try {
    const [settings, homeSeo] = await Promise.all([getSettings(), getSeo("home")]);

    const brand = settings.brandName || "GiftVibes";
    const defaultTitle = homeSeo?.title
      ?? `${brand} | Customised Corporate Diaries Manufacturer Delhi`;
    const defaultDescription = homeSeo?.description
      ?? `${brand} (Ravindra Enterprises) manufactures customised diaries, planners and corporate gift sets in Delhi since 1999. Bulk branding, PAN-India delivery.`;
    const siteUrl = normalizePublicSiteUrl(settings.siteUrl);
    const ogImage = homeSeo?.ogImageUrl || settings.logoUrl || "/logo3.png";
    const favicon = settings.faviconUrl || "/favicon/favicon.png";

    return {
      metadataBase: new URL(siteUrl),
      title: {
        default: defaultTitle,
        template: `%s | ${brand}`,
      },
      description: defaultDescription,
      keywords: [
        "customised diaries manufacturer Delhi",
        "bulk corporate diaries India",
        "promotional diaries with logo",
        "PU leather diary wholesale",
        "New Year diary 2027 bulk",
        brand.toLowerCase(),
      ],
      openGraph: {
        title: defaultTitle,
        description: defaultDescription,
        siteName: brand,
        locale: "en_IN",
        type: "website",
        images: [{ url: ogImage, width: 1200, height: 630, alt: `${brand} customised diaries and corporate gifts` }],
      },
      twitter: {
        card: "summary_large_image",
        title: defaultTitle,
        description: defaultDescription,
        images: [ogImage],
      },
      robots: { index: true, follow: true },
      icons: { icon: favicon },
    };
  } catch (e) {
    console.error("generateMetadata failed", e);
    return {
      title: "GiftVibes | Customised Diaries & Corporate Gifts",
      description: "Customised diaries, notebooks, and corporate gifts.",
      metadataBase: new URL("https://www.giftvibes.in"),
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Visual edit / Orchids tooling only inside iframes (builder preview) — not on the live site.
  const enableVisualEdits = process.env.NEXT_PUBLIC_ENABLE_VISUAL_EDITS === "true";

  return (
    <html lang="en">
      <body className="antialiased">
        <ProductProvider>
          {enableVisualEdits && <ErrorReporter />}
          {enableVisualEdits && (
            <Script
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
              strategy="afterInteractive"
              data-target-origin="*"
              data-message-type="ROUTE_CHANGE"
              data-include-search-params="true"
              data-only-in-iframe="true"
              data-debug="true"
              data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
            />
          )}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
          />
          <Toaster position="top-center" richColors expand />
          {children}
          <WhatsAppButton />
          {enableVisualEdits && <VisualEditsMessenger />}
        </ProductProvider>
      </body>
    </html>
  );
}
