"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";
  const initialEmail = searchParams.get("email") || "";
  const initialStep = searchParams.get("step") === "verify" ? "verify" : "form";

  const { register, verifyOtp, resendOtp } = useCustomerAuth();

  const [step, setStep] = useState<"form" | "verify">(initialStep);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP state
  const [otp, setOtp] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cooldown countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "verify" && cooldownSeconds > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setCooldownSeconds((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (cooldownSeconds === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, cooldownSeconds]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    const res = await register(fullName, email, password, confirmPassword);
    setLoading(false);

    if (res.success) {
      setStep("verify");
      setCooldownSeconds(60);
      setCanResend(false);
      setSuccessMessage(`A 6-digit verification code has been sent to ${res.email || email}.`);
    } else {
      setError(res.error || "Registration failed. Please try again.");
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp.trim().length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    const res = await verifyOtp(email, otp.trim());
    setLoading(false);

    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.error || "Verification failed.");
    }
  };

  const handleResendCode = async () => {
    if (!canResend || resending) return;
    setError(null);
    setResending(true);

    const res = await resendOtp(email);
    setResending(false);

    if (res.success) {
      setCooldownSeconds(60);
      setCanResend(false);
      setSuccessMessage("A fresh verification code has been sent to your email.");
    } else {
      setError(res.error || "Failed to resend code.");
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-12 selection:bg-amber-500 selection:text-zinc-950 overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 p-8 shadow-2xl backdrop-blur-xl">
          {/* Brand icon */}
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-zinc-950 shadow-lg shadow-amber-500/25">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
              {step === "form" ? "Create Account" : "Verify Your Email"}
            </h1>
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
              {step === "form"
                ? "Join LaserUVCreatives to track personalized gifts across Pakistan."
                : `Enter the 6-digit OTP code sent to ${email}`}
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-semibold text-rose-700 dark:text-rose-300">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-rose-700 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {successMessage && !error && (
            <div className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-300">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          {step === "form" ? (
            /* STEP 1: Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  id="register-fullname"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Muhammad Usman"
                  className="w-full rounded-xl border border-zinc-300/80 dark:border-zinc-700/80 bg-zinc-50/70 dark:bg-zinc-950/70 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  id="register-email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="w-full rounded-xl border border-zinc-300/80 dark:border-zinc-700/80 bg-zinc-50/70 dark:bg-zinc-950/70 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Password (min. 8 characters)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="register-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full rounded-xl border border-zinc-300/80 dark:border-zinc-700/80 bg-zinc-50/70 dark:bg-zinc-950/70 px-4 py-3 pr-11 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="register-confirm-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full rounded-xl border border-zinc-300/80 dark:border-zinc-700/80 bg-zinc-50/70 dark:bg-zinc-950/70 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                id="register-submit-btn"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/25 transition-all hover:from-amber-400 hover:to-amber-500 active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-zinc-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Sending Verification Code...</span>
                  </>
                ) : (
                  <span>Send Verification Code →</span>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: Email OTP Verification */
            <form onSubmit={handleVerifySubmit} className="space-y-6">
              <div>
                <label className="block text-center text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-3">
                  6-Digit Email Verification Code
                </label>
                <div className="flex justify-center">
                  <input
                    type="text"
                    id="otp-input"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="••••••"
                    className="w-56 text-center tracking-[12px] text-2xl font-black font-mono rounded-xl border-2 border-amber-500/50 bg-zinc-50/80 dark:bg-zinc-950/80 py-3.5 text-amber-700 dark:text-amber-400 placeholder-zinc-700 outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-500/50"
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-center text-[11px] text-zinc-600 dark:text-zinc-400">
                  Verification code expires in 10 minutes.
                </p>
              </div>

              <button
                type="submit"
                id="otp-verify-submit-btn"
                disabled={loading || otp.length !== 6}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/25 transition-all hover:from-amber-400 hover:to-amber-500 active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-zinc-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <span>Verify &amp; Activate Account</span>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  ← Edit registration info
                </button>

                <button
                  type="button"
                  id="resend-otp-btn"
                  onClick={handleResendCode}
                  disabled={!canResend || resending}
                  className="font-bold text-amber-700 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {resending
                    ? "Resending..."
                    : canResend
                    ? "Resend Code"
                    : `Resend in ${cooldownSeconds}s`}
                </button>
              </div>
            </form>
          )}

          {/* Sign In Link */}
          <div className="mt-8 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-6 text-center text-xs text-zinc-600 dark:text-zinc-400">
            <span>Already have an account? </span>
            <Link
              href={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : "/login"}
              className="font-bold text-amber-700 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-600 dark:text-zinc-400">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
