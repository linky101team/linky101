"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import Card from "@/components/ui/GameCard";

export default function VerifyPage() {
  const supabase = useMemo(() => createClientSupabase(), []);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleResend() {
    if (!email) return;
    setStatus("sending");
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setStatus(error ? "error" : "sent");
  }

  return (
    <main className="auth-gradient-bg flex min-h-screen flex-col items-center justify-center gap-6 px-5 py-10 text-center">
      <Card className="flex w-full max-w-sm flex-col items-center gap-4">
        <span className="text-5xl">📧</span>
        <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
        <p className="text-sm leading-relaxed text-gray-600">
          We&apos;ve sent you a verification link. Tap it to activate your LinkY101 account,
          then come back and sign in.
        </p>

        <div className="mt-2 w-full">
          <label className="mb-1 block text-left text-xs font-semibold text-gray-500">
            Didn&apos;t get it? Resend to:
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#039BE5] focus:outline-none focus:ring-1 focus:ring-[#039BE5]"
            />
          </div>
          <button
            type="button"
            disabled={!email || status === "sending"}
            onClick={handleResend}
            className="mt-3 w-full rounded-full bg-[#1A1A2E] py-3 text-sm font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            {status === "sending" ? "Sending..." : "Resend email"}
          </button>
          {status === "sent" && (
            <p className="mt-2 text-xs font-semibold text-[#2ECC71]">Verification email sent!</p>
          )}
          {status === "error" && (
            <p className="mt-2 text-xs font-semibold text-[#FF6B6B]">
              Couldn&apos;t resend right now — try again shortly.
            </p>
          )}
        </div>
      </Card>

      <p className="text-sm text-gray-600">
        Already verified?{" "}
        <Link href="/login" className="font-semibold text-[#039BE5] hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
