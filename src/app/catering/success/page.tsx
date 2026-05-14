import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { maintenanceGate } from "@/lib/maintenance";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";

export default async function CateringSuccess({ searchParams }: { searchParams: { n?: string } }) {
  await maintenanceGate();
  const lang = await getLang();
  const t = dict[lang];
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-gold-gradient flex items-center justify-center text-ink-900">
        <CheckCircle2 className="w-9 h-9" />
      </div>
      <h1 className="font-display text-4xl font-bold mt-4">
        {t.cateringSuccess} <span className="text-gold-gradient">{t.cateringSuccessAccent}</span>
      </h1>
      <p className="text-cream/70 mt-2">{t.cateringSuccessMessage}</p>
      {searchParams.n && (
        <p className="text-sm text-cream/60 mt-3">
          {t.cateringReference} <span className="font-mono text-gold-300">{searchParams.n}</span>
        </p>
      )}
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/menu" className="btn-outline-gold">{t.browseMenu}</Link>
        <Link href="/" className="btn-gold">{t.backHome}</Link>
      </div>
    </div>
  );
}
