import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/site-url";

const PRIVATE_PATHS = [
  "/admin/",
  "/api/",
  "/auth/",
  "/account/",
  "/order/", // order confirmation pages — private to the customer
  "/checkout",
  "/cart",
  "/maintenance",
];

// Major AI crawlers we want to welcome explicitly. They all also accept the
// wildcard rule below, but listing them makes our intent obvious.
const AI_BOTS = [
  "GPTBot", // OpenAI
  "ChatGPT-User", // ChatGPT browsing
  "OAI-SearchBot", // ChatGPT Search
  "Google-Extended", // Gemini training
  "ClaudeBot", // Anthropic Claude
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "CCBot", // Common Crawl — feeds many AI training pipelines
  "Applebot-Extended", // Apple Intelligence
  "Bytespider", // TikTok/Bytedance
  "Amazonbot",
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const s = await getSettings();
  const url = siteUrl(s);

  if (s.maintenanceMode) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: [
      // All standard search engines and AI crawlers
      { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },

      // Explicit allow for AI bots (same as wildcard but documented)
      ...AI_BOTS.map((bot) => ({
        userAgent: bot,
        allow: "/",
        disallow: PRIVATE_PATHS,
      })),
    ],
    sitemap: `${url}/sitemap.xml`,
    host: url,
  };
}
