import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShoppingBag, CalendarCheck, Utensils, LayoutDashboard, Settings, MessageSquare } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/catering", label: "Catering", icon: CalendarCheck },
  { href: "/admin/menu", label: "Menu", icon: Utensils },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/auth/login?callbackUrl=/admin");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold">
          <span className="text-gold-gradient">Admin</span> Dashboard
        </h1>
        <p className="text-sm text-cream/60">{session.user.email}</p>
      </div>
      <nav className="flex flex-wrap gap-2 mb-8 border-b border-gold-900/40 pb-4">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="px-4 py-2 rounded-md text-sm font-semibold text-cream/80 hover:bg-gold-500/10 hover:text-gold-300 flex items-center gap-2"
          >
            <n.icon className="w-4 h-4" /> {n.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
