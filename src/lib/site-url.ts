import type { SiteSettings } from "./settings";

/**
 * Best-effort canonical site URL.
 * Priority: env NEXT_PUBLIC_SITE_URL → settings.website → goseattlecatering.com
 */
export function siteUrl(s?: Pick<SiteSettings, "website">): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/$/, "");

  const w = s?.website?.trim();
  if (w) {
    const withProto = /^https?:\/\//i.test(w) ? w : `https://${w}`;
    return withProto.replace(/\/$/, "");
  }
  return "https://www.goseattlecatering.com";
}
