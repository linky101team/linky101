"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClientSupabase } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/authErrors";
import Card from "@/components/ui/GameCard";
import Button from "@/components/ui/GradientButton";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#039BE5] focus:ring-1 focus:ring-[#039BE5] focus:outline-none";

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
    <main className="auth-gradient-bg flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Link<span className="text-[#FF6B6B]">Y</span>101
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Your professional network — before LinkedIn
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">
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
              <label className="mb-1 block text-sm font-medium text-gray-600">
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

            {errorMsg && (
              <p className="text-center text-sm text-red-500">{errorMsg}</p>
            )}

            <Button
              type="submit"
              variant="pink"
              disabled={submitting}
              className="w-full"
            >
              {submitting ? "Logging in..." : "Log In"}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-gray-600">
          New to LinkY101?{" "}
          <Link href="/signup" className="text-[#FF6B6B] hover:underline">
            Join now
          </Link>
        </p>
      </div>
    </main>
  );
}
