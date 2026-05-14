import Image from "next/image";
import Link from "next/link";

export function Logo({
  size = 44,
  src = "/images/logos/logo-dark.jpg",
  brandName = "Gõ Seattle",
}: {
  size?: number;
  src?: string;
  brandName?: string;
}) {
  // Show only first 2 words large + "Catering" small (works for any brand)
  const words = brandName.trim().split(/\s+/);
  const top = words.slice(0, 2).join(" ");
  const sub = words.length > 2 ? words.slice(2).join(" ") : "Catering";
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <Image
        src={src}
        alt={brandName}
        width={size}
        height={size}
        className="rounded-md shadow-gold transition-transform group-hover:scale-105 object-contain bg-ink-900"
        priority
      />
      <div className="hidden sm:flex flex-col leading-tight">
        <span className="font-display text-lg text-gold-gradient font-bold tracking-wide">
          {top}
        </span>
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold-700">
          {sub}
        </span>
      </div>
    </Link>
  );
}
