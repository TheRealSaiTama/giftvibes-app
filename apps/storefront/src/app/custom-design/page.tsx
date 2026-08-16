import type { Metadata } from "next";
import CustomDesignClient from "./CustomDesignClient";
import { getStorefrontData } from "@/lib/site";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Custom Print & Logo Branding on Diaries",
  description:
    "Emboss, hot foil, laser, each-page logo print and custom covers. GiftVibes Delhi factory handles bulk corporate branding on diaries and gift sets.",
  alternates: { canonical: "/custom-design" },
};

export default async function CustomDesignPage() {
  const data = await getStorefrontData();
  return (
    <CustomDesignClient
      headerNav={data.headerNav}
      megaMenu={data.megaMenu}
      settings={data.settings}
      footerLinks={data.footerLinks}
    />
  );
}
