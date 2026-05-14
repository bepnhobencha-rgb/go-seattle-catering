import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const s = await getSettings();
  const base = siteUrl(s);

  // If site is in maintenance, don't expose any URLs.
  if (s.maintenanceMode) return [];

  const now = new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/menu`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/catering`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  // Could fan out per-category later via /menu#category-slug fragments
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true },
    });
    for (const c of categories) {
      pages.push({
        url: `${base}/menu#${c.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch {
    // DB unavailable at build time — return static pages only
  }

  return pages;
}
