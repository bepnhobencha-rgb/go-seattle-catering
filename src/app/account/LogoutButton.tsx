"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton({ label = "Sign out" }: { label?: string }) {
  return (
    <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-outline-gold">
      <LogOut className="w-4 h-4" /> {label}
    </button>
  );
}
