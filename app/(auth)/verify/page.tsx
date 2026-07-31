"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import GameCard from "@/components/ui/GameCard";
import GradientButton from "@/components/ui/GradientButton";

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
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-5 py-10 text-center">
      <GameCard borderColor="sky" glowColor="sky" className="flex flex-col items-center gap-4">
        <span className="text-5xl">📧</span>
        <h1 className="heading-game text-2xl">Check your email!</h1>
        <p className="text-sm font-bold text-text-muted">
          We&apos;ve sent you a verification link. Tap it to activate your LinkY101 account,
          then come back and log in.
        </p>

        <div className="mt-2 w-full">
          <label className="mb-1 block text-left text-xs font-black uppercase tracking-wide text-text-muted">
            Didn&apos;t get it? Resend to:
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border-3 border-border bg-navy/60 py-2 pl-9 pr-3 text-sm font-bold text-white placeholder:text-text-muted focus:border-sky focus:outline-none"
              />
            </div>
          </div>
          <GradientButton
            variant="sky"
            size="sm"
            className="mt-3 w-full"
            disabled={!email || status === "sending"}
            onClick={handleResend}
          >
            {status === "sending" ? "Sending..." : "Resend Email"}
          </GradientButton>
          {status === "sent" && (
            <p className="mt-2 text-xs font-bold text-green">Verification email sent!</p>
          )}
          {status === "error" && (
            <p className="mt-2 text-xs font-bold text-orange">
              Couldn&apos;t resend right now — try again shortly.
            </p>
          )}
        </div>
      </GameCard>

      <p className="text-sm font-bold text-text-muted">
        Already verified?{" "}
        <Link href="/login" className="text-pink">
          Log in
        </Link>
      </p>
    </main>
  );
}
