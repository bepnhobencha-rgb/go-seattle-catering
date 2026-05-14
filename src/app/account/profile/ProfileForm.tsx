"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "@/components/Toaster";
import { Save, Loader2 } from "lucide-react";
import type { Lang } from "@/lib/i18n";

const L = {
  en: {
    profile: "Profile",
    name: "Name",
    email: "Email",
    saveProfile: "Save profile",
    changePassword: "Change password",
    currentPassword: "Current password",
    newPassword: "New password (min 6 chars)",
    confirmPassword: "Confirm new password",
    update: "Update password",
    saving: "Saving…",
    profileUpdated: "Profile updated",
    passwordChanged: "Password changed — please sign in again",
    passwordMismatch: "Passwords don't match",
    needCurrent: "Enter your current password",
  },
  vn: {
    profile: "Hồ sơ",
    name: "Tên",
    email: "Email",
    saveProfile: "Lưu hồ sơ",
    changePassword: "Đổi mật khẩu",
    currentPassword: "Mật khẩu hiện tại",
    newPassword: "Mật khẩu mới (tối thiểu 6 ký tự)",
    confirmPassword: "Xác nhận mật khẩu mới",
    update: "Đổi mật khẩu",
    saving: "Đang lưu…",
    profileUpdated: "Đã cập nhật hồ sơ",
    passwordChanged: "Đã đổi mật khẩu — vui lòng đăng nhập lại",
    passwordMismatch: "Mật khẩu không khớp",
    needCurrent: "Nhập mật khẩu hiện tại",
  },
} as const;

export function ProfileForm({
  currentEmail,
  currentName,
  lang,
}: {
  currentEmail: string;
  currentName: string;
  lang: Lang;
}) {
  const l = L[lang];
  const [profile, setProfile] = useState({ name: currentName, email: currentEmail });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: profile.name, email: profile.email }),
    });
    setSavingProfile(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(data.error || "Update failed", "error");
      return;
    }
    toast(l.profileUpdated, "success");
    // Email may have changed → session is stale. Sign user out so they log back in.
    if (profile.email !== currentEmail) {
      setTimeout(() => signOut({ callbackUrl: "/auth/login" }), 800);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!pw.current) {
      toast(l.needCurrent, "error");
      return;
    }
    if (pw.next.length < 6) {
      toast("Min 6 characters", "error");
      return;
    }
    if (pw.next !== pw.confirm) {
      toast(l.passwordMismatch, "error");
      return;
    }
    setSavingPw(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }),
    });
    setSavingPw(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(data.error || "Update failed", "error");
      return;
    }
    toast(l.passwordChanged, "success");
    setTimeout(() => signOut({ callbackUrl: "/auth/login" }), 800);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={saveProfile} className="card p-6 space-y-4">
        <h2 className="font-display text-xl font-bold text-gold-200">{l.profile}</h2>
        <div>
          <label className="label-dark">{l.name}</label>
          <input
            required
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="input-dark"
          />
        </div>
        <div>
          <label className="label-dark">{l.email}</label>
          <input
            required
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className="input-dark"
          />
        </div>
        <button disabled={savingProfile} className="btn-gold disabled:opacity-60">
          {savingProfile ? <><Loader2 className="w-4 h-4 animate-spin" /> {l.saving}</> : <><Save className="w-4 h-4" /> {l.saveProfile}</>}
        </button>
      </form>

      <form onSubmit={changePassword} className="card p-6 space-y-4">
        <h2 className="font-display text-xl font-bold text-gold-200">{l.changePassword}</h2>
        <div>
          <label className="label-dark">{l.currentPassword}</label>
          <input
            required
            type="password"
            value={pw.current}
            onChange={(e) => setPw({ ...pw, current: e.target.value })}
            className="input-dark"
            autoComplete="current-password"
          />
        </div>
        <div>
          <label className="label-dark">{l.newPassword}</label>
          <input
            required
            type="password"
            minLength={6}
            value={pw.next}
            onChange={(e) => setPw({ ...pw, next: e.target.value })}
            className="input-dark"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="label-dark">{l.confirmPassword}</label>
          <input
            required
            type="password"
            minLength={6}
            value={pw.confirm}
            onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
            className="input-dark"
            autoComplete="new-password"
          />
        </div>
        <button disabled={savingPw} className="btn-gold disabled:opacity-60">
          {savingPw ? <><Loader2 className="w-4 h-4 animate-spin" /> {l.saving}</> : <><Save className="w-4 h-4" /> {l.update}</>}
        </button>
      </form>
    </div>
  );
}
