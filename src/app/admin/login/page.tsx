"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@laseruvcreatives.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAdmin();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const success = await login({ email, password });
    setIsSubmitting(false);

    if (success) {
      router.push("/admin");
    } else {
      setError("Invalid administrative credentials. Please verify your email and password.");
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-12 overflow-hidden selection:bg-amber-500 selection:text-zinc-950">
      {/* Decorative ambient glowing backdrops */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl"></div>

      <div className="relative w-full max-w-md">
        {/* Card Container */}
        <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-xl">
          {/* Logo Badge */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/25">
            <svg
              className="h-8 w-8 text-zinc-950"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Administrative Portal</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
              Admin Sign In
            </h1>
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
              Protected administrative surface. Server-side authorized access only.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-rose-500/50 bg-rose-500/10 p-4 text-xs font-semibold text-rose-700 dark:text-rose-300">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-rose-700 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                id="admin-email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@laseruvcreatives.com"
                className="w-full rounded-xl border border-zinc-300/80 dark:border-zinc-700/80 bg-zinc-50/70 dark:bg-zinc-950/70 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Admin Password / Master Passkey
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="admin-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password or PIN"
                  className="w-full rounded-xl border border-zinc-300/80 dark:border-zinc-700/80 bg-zinc-50/70 dark:bg-zinc-950/70 px-4 py-3 pr-11 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                id="admin-login-submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/25 transition-all hover:from-amber-400 hover:to-amber-500 active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-zinc-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Authenticating Server Session...</span>
                  </>
                ) : (
                  <span>Access Admin Workspace →</span>
                )}
              </button>
            </div>
          </form>

          {/* Quick tips & links */}
          <div className="mt-8 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-6 flex items-center justify-between text-xs text-zinc-500">
            <Link
              href="/"
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>← Back to Storefront</span>
            </Link>

            <Link
              href="/login"
              className="text-amber-700/80 dark:text-amber-400/80 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
            >
              Customer Sign In →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
