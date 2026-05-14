import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-display text-4xl font-bold text-center">
        <span className="text-gold-gradient">Welcome back</span>
      </h1>
      <p className="text-center text-cream/70 mt-2">Sign in to your account</p>

      <Suspense fallback={<div className="mt-8 card p-6">Loading…</div>}>
        <LoginForm />
      </Suspense>

      <div className="mt-8 text-xs text-cream/50 text-center space-y-1">
        <p>Demo accounts:</p>
        <p className="font-mono">admin@goseattlecatering.com / admin123</p>
        <p className="font-mono">demo@example.com / demo123</p>
      </div>
    </div>
  );
}
