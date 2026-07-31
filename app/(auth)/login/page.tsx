"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClientSupabase } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/authErrors";
import GameCard from "@/components/ui/GameCard";
import GradientButton from "@/components/ui/GradientButton";

const inputClass =
  "w-full rounded-xl border-3 border-border bg-white px-4 py-3 font-bold text-ink placeholder:text-text-muted focus:border-sky focus:outline-none";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClientSupabase(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("Enter your email and password.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);

    if (error) {
      setErrorMsg(friendlyAuthError(error.message));
      return;
    }

    router.push("/home");
    router.refresh();
  }

  return (
    <main className="auth-gradient-bg flex min-h-screen flex-col justify-center gap-6 px-5 py-10">
      <div className="text-center">
        <span className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-3xl border-3 border-sky bg-gradient-primary text-2xl font-black text-white shadow-glow-sky">
          🚀
        </span>
        <h1 className="heading-game text-3xl">
          Link<span className="text-sky">Y</span>101
        </h1>
        <p className="mt-1 text-sm font-bold text-ink">Welcome back.</p>
      </div>

      <GameCard borderColor="sky" glowColor="sky">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-black uppercase tracking-wide text-text-muted">
              Email
            </label>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-black uppercase tracking-wide text-text-muted">
              Password
            </label>
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
            />
          </div>

          {errorMsg && <p className="text-center text-sm font-bold text-orange">{errorMsg}</p>}

          <GradientButton
            type="submit"
            variant="sky"
            size="lg"
            disabled={submitting}
            className="w-full"
          >
            {submitting ? "Logging in..." : "Log In"}
          </GradientButton>
        </form>
      </GameCard>

      <p className="text-center text-sm font-bold text-text-muted">
        New to LinkY101?{" "}
        <Link href="/signup" className="text-pink">
          Join now
        </Link>
      </p>
    </main>
  );
}
