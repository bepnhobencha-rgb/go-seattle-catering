import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { maintenanceGate } from "@/lib/maintenance";

export default async function CateringSuccess({ searchParams }: { searchParams: { n?: string } }) {
  await maintenanceGate();
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-gold-gradient flex items-center justify-center text-ink-900">
        <CheckCircle2 className="w-9 h-9" />
      </div>
      <h1 className="font-display text-4xl font-bold mt-4">
        Request <span className="text-gold-gradient">received</span>
      </h1>
      <p className="text-cream/70 mt-2">
        Thank you for considering us for your event. We&apos;ll get back to you within 24–48 hours
        with a custom quote.
      </p>
      {searchParams.n && (
        <p className="text-sm text-cream/60 mt-3">
          Reference number: <span className="font-mono text-gold-300">{searchParams.n}</span>
        </p>
      )}
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/menu" className="btn-outline-gold">Browse menu</Link>
        <Link href="/" className="btn-gold">Back home</Link>
      </div>
    </div>
  );
}
