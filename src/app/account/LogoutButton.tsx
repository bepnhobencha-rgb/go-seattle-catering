"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="btn-outline-gold"
    >
      <LogOut className="w-4 h-4" /> Sign out
    </button>
  );
}
