import CustomDesignClient from "./CustomDesignClient";
import { getStorefrontData } from "@/lib/site";

export const revalidate = 0;

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
