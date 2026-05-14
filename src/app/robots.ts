import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/site-url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const s = await getSettings();
  const url = siteUrl(s);

  // Block all crawlers while maintenance mode is on
  if (s.maintenanceMode) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/auth/",
          "/account/",
          "/order/", // order confirmation pages — private to the customer
          "/checkout",
          "/cart",
          "/maintenance",
        ],
      },
    ],
    sitemap: `${url}/sitemap.xml`,
    host: url,
  };
}
