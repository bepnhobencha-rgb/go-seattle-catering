import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/site-url";

/**
 * /llms.txt — proposed standard (Anthropic) for helping LLMs quickly understand a site.
 * https://llmstxt.org
 */
export async function GET() {
  const s = await getSettings();
  const url = siteUrl(s);

  if (s.maintenanceMode) {
    return new NextResponse("# Site temporarily offline\n", {
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  }

  const categories = await prisma.category
    .findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      include: {
        items: {
          where: { isActive: true },
          orderBy: { displayOrder: "asc" },
        },
      },
    })
    .catch(() => []);

  const hoursList = s.hours
    .map((h) => `- **${h.day}**: ${h.hours}`)
    .join("\n");

  const menuSections = categories
    .map((c) => {
      const items = c.items
        .map((it) => {
          const name = it.nameVn ? `${it.nameEn} / ${it.nameVn}` : it.nameEn;
          const code = it.code ? `[${it.code}] ` : "";
          return `- ${code}**${name}** — $${it.basePrice.toFixed(2)}${
            it.description ? `\n  ${it.description}` : ""
          }`;
        })
        .join("\n");
      return `### ${c.nameEn} / ${c.nameVn}\n\n${items}`;
    })
    .join("\n\n");

  const body = `# ${s.name}

${s.sloganEn}
${s.sloganVn}

> ${s.homeHeroIntro}

## About

Vietnamese catering and party tray service based in Seattle, WA, USA.
We serve authentic Vietnamese food for weddings, private parties, corporate events,
and family gatherings — from 10 to ${s.cateringMaxGuests}+ guests. Bánh Mì, Phở,
Gỏi Cuốn, Bún, Cơm, Vietnamese coffee, fresh-fruit smoothies, milk tea.

## Contact

${s.address ? `- **Address**: ${s.address}\n` : ""}${s.phone ? `- **Phone**: ${s.phone}\n` : ""}${s.email ? `- **Email**: ${s.email}\n` : ""}${s.website ? `- **Website**: ${url}\n` : ""}${s.facebook ? `- **Facebook**: ${s.facebook}\n` : ""}

## Hours

${hoursList}

## Services

- **Online ordering** — pickup from store (${url}/menu)
- **Event catering** — custom quotes for weddings, corporate, private parties (${url}/catering)
- **Languages**: English + Vietnamese (Tiếng Việt)
${s.stripeEnabled ? "- **Payment**: online card (Stripe) and pay-at-pickup\n" : "- **Payment**: pay at pickup (cash or card)\n"}

## Key pages

- Home: ${url}/
- Menu: ${url}/menu
- Catering / Event quote: ${url}/catering
- About: ${url}/about
- Contact: ${url}/contact

## Menu

${menuSections}

---

For machine-readable data see ${url}/sitemap.xml and the JSON-LD Restaurant
schema embedded on every page.
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
