import * as React from "react";
import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import WhatsAppButton from "@/components/WhatsAppButton";
import Script from "next/script";
import { Toaster } from "sonner";
import { ProductProvider } from '@/context/ProductContext';

export const metadata: Metadata = {
  title: "GiftVibes| Customised Diaries 2026 | Customised Note Books | Customised Corporate Gifts",
  description: "Premium diaries, planners, and corporate gifting curated by GiftVibes.",
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
