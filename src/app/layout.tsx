import * as React from "react";
import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import WhatsAppButton from "@/components/WhatsAppButton";
import Script from "next/script";
import { Toaster } from "sonner";
import { ProductProvider } from '@/context/ProductContext';

const defaultTitle = "GiftVibes| Customised Diaries 2026 | Customised Note Books | Customised Corporate Gifts";
const defaultDescription = "GiftVibes crafts personalised diaries, notebooks, planners, and premium corporate gifts for 2026 with bespoke branding and nationwide delivery.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.giftvibes.in"),
  title: {
    default: defaultTitle,
    template: "%s | GiftVibes",
  },
  description: defaultDescription,
  keywords: [
    "customised diaries",
    "personalised notebooks",
    "corporate gifts india",
    "diary printing 2026",
    "giftvibes",
    "custom planners",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "GiftVibes | Customised Diaries, Notebooks & Corporate Gifts 2026",
    description: defaultDescription,
    url: "/",
    siteName: "GiftVibes",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "GiftVibes customised diaries, notebooks, and corporate gifts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GiftVibes | Customised Diaries, Notebooks & Corporate Gifts 2026",
    description: defaultDescription,
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon/favicon.png",
  },
};

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
