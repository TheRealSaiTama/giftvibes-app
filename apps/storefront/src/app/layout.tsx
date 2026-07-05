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

// ponytail: metadata now comes from admin's site_settings + page_seo (home) with the previous
// hardcoded values as fallback. DB down → site still ships SEO.
export async function generateMetadata(): Promise<Metadata> {
  const [settings, homeSeo] = await Promise.all([getSettings(), getSeo("home")]);

  const defaultTitle = homeSeo?.title
    ?? `${settings.brandName} | Customised Diaries 2026 | Customised Note Books | Customised Corporate Gifts`;
  const defaultDescription = homeSeo?.description
    ?? `${settings.brandName} crafts personalised diaries, notebooks, planners, and premium corporate gifts for 2026 with bespoke branding and nationwide delivery.`;
  const siteUrl = settings.siteUrl ?? "https://www.giftvibes.in";
  const ogImage = homeSeo?.ogImageUrl ?? settings.logoUrl ?? "/logo.png";
  const favicon = settings.faviconUrl ?? "/favicon/favicon.png";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: defaultTitle,
      template: `%s | ${settings.brandName}`,
    },
    description: defaultDescription,
    keywords: [
      "customised diaries",
      "personalised notebooks",
      "corporate gifts india",
      "diary printing 2026",
      settings.brandName.toLowerCase(),
      "custom planners",
    ],
    alternates: { canonical: "/" },
    openGraph: {
      title: defaultTitle,
      description: defaultDescription,
      url: "/",
      siteName: settings.brandName,
      locale: "en_IN",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${settings.brandName} customised diaries, notebooks, and corporate gifts` }],
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ProductProvider>
          <ErrorReporter />
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
          <Toaster position="top-center" richColors expand />
          {children}
          <WhatsAppButton />
          <VisualEditsMessenger />
        </ProductProvider>
      </body>
    </html>
  );
}
