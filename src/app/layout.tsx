import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { AdminMaintenanceBanner } from "@/components/AdminMaintenanceBanner";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/site-url";
import { restaurantSchema } from "@/lib/structured-data";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "600", "700", "800"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0A0A0A",
};

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const url = siteUrl(s);
  const title = `${s.name} — Vietnamese Catering & Party Trays in Seattle`;
  const description = `Authentic Vietnamese catering for weddings, private parties, corporate events, and family gatherings in Seattle. Bánh Mì, Phở, Gỏi Cuốn, party trays — order online or request a custom event quote.`;

  return {
    metadataBase: new URL(url),
    title: {
      default: title,
      template: `%s · ${s.name}`,
    },
    description,
    keywords: [
      "Vietnamese catering Seattle",
      "Vietnamese restaurant Seattle",
      "đặt tiệc Việt Seattle",
      "bánh mì Seattle",
      "phở Seattle",
      "Vietnamese wedding catering",
      "party trays Seattle",
      "gỏi cuốn",
      "Vietnamese food delivery",
      s.name,
    ],
    authors: [{ name: s.name }],
    creator: s.name,
    publisher: s.name,
    formatDetection: { telephone: true, address: true, email: true },
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: s.name,
      title,
      description,
      url,
      locale: "en_US",
      alternateLocale: ["vi_VN"],
      images: [
        {
          url: `${url}/images/food/banh-mi-tray.jpg`,
          width: 1600,
          height: 1067,
          alt: `${s.name} — Vietnamese party trays`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${url}/images/food/banh-mi-tray.jpg`],
    },
    robots: {
      index: !s.maintenanceMode,
      follow: !s.maintenanceMode,
      googleBot: {
        index: !s.maintenanceMode,
        follow: !s.maintenanceMode,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: { icon: "/favicon.ico" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, lang] = await Promise.all([getSettings(), getLang()]);
  const t = dict[lang];
  const url = siteUrl(settings);
  const schema = restaurantSchema(settings, url);
  return (
    <html lang={lang === "vn" ? "vi" : "en"} className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </head>
      <body className="min-h-screen bg-ink-900 text-cream antialiased flex flex-col">
        <Providers>
          <AdminMaintenanceBanner />
          <Header logo={settings.logo} brandName={settings.name} lang={lang} t={t} />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
