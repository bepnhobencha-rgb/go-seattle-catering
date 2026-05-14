import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileForm } from "./ProfileForm";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "My profile — Gõ Seattle Catering",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login?callbackUrl=/account/profile");
  const lang = await getLang();
  const t = dict[lang];

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <Link href="/account" className="text-sm text-gold-300 hover:text-gold-200 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> {t.navAccount}
      </Link>
      <h1 className="font-display text-3xl font-bold">
        <span className="text-gold-gradient">{lang === "vn" ? "Hồ sơ của tôi" : "My profile"}</span>
      </h1>
      <p className="text-cream/65 text-sm mt-1">
        {lang === "vn"
          ? "Cập nhật email và mật khẩu của bạn."
          : "Update your email address and password."}
      </p>
      <div className="mt-6">
        <ProfileForm
          currentEmail={session.user.email}
          currentName={session.user.name}
          lang={lang}
        />
      </div>
    </div>
  );
}
