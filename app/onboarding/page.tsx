"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfileStore } from "@/hooks/useProfile";
import { INTEREST_TAGS } from "@/lib/interests";

const MIN_INTERESTS = 3;
const DREAM_MAX = 500;

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClientSupabase(), []);
  const { fetchProfile, updateProfile } = useProfileStore();

  const [initializing, setInitializing] = useState(true);
  const [step, setStep] = useState(1);
  const [interests, setInterests] = useState<string[]>([]);
  const [dream, setDream] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existing) {
        const meta = user.user_metadata ?? {};
        await supabase.from("profiles").insert({
          id: user.id,
          first_name: meta.first_name ?? "New Member",
          age: meta.age ?? 13,
          school_type: meta.school_type ?? null,
          school_id: meta.school_id ?? null,
        });
      }

      await fetchProfile();
      setInitializing(false);
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleInterest(tag: string) {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleFinish() {
    setSaving(true);

    // Never make the user stare at "Getting Ready" for more than 1.5s —
    // race the real save against a timeout and navigate at whichever comes
    // first. If the network is slow, the save keeps running in the
    // background and the store updates whenever it lands.
    const work = (async () => {
      await updateProfile({
        interests,
        dream: dream.trim() ? dream.trim() : null,
        onboarding_completed: true,
      });

      await fetchProfile();
    })();

    await Promise.race([work, new Promise((resolve) => setTimeout(resolve, 1500))]);
    router.push("/home");
  }

  if (initializing) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="font-semibold text-gray-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col gap-6 px-5 py-8">
      {step < 3 && (
        <div className="flex justify-center gap-2">
          {[1, 2].map((s) => (
            <span
              key={s}
              className={`h-2 w-8 rounded-full transition-colors ${
                s <= step ? "bg-[#1A1A2E]" : "bg-white"
              }`}
            />
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-1 flex-col gap-5">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">What are you into?</h1>
            <p className="mt-1 text-sm text-gray-600">
              Pick at least {MIN_INTERESTS} — we&apos;ll shape your feed around them ({interests.length} picked)
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {INTEREST_TAGS.map((tag) => {
              const selected = interests.includes(tag);
              return (
                <motion.button
                  key={tag}
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => toggleInterest(tag)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                    selected
                      ? "bg-[#1A1A2E] text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-600"
                  }`}
                >
                  {tag}
                </motion.button>
              );
            })}
          </div>

          <div className="mt-auto">
            <button
              type="button"
              disabled={interests.length < MIN_INTERESTS}
              onClick={() => setStep(2)}
              className="w-full rounded-full bg-[#1A1A2E] py-4 text-base font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-1 flex-col gap-5">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">What&apos;s your dream?</h1>
            <p className="mt-1 text-sm text-gray-600">
              What do you want to build one day? It goes on your profile. (optional)
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <textarea
              value={dream}
              onChange={(e) => setDream(e.target.value.slice(0, DREAM_MAX))}
              placeholder="I want to launch my own..."
              rows={5}
              className="w-full resize-none bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            <p className="mt-1 text-right text-xs font-semibold text-gray-400">
              {dream.length}/{DREAM_MAX}
            </p>
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-full rounded-full bg-[#1A1A2E] py-4 text-base font-bold text-white transition-transform active:scale-[0.98]"
            >
              Next
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="py-2 text-sm font-semibold text-gray-500"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="relative flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="text-6xl">🎉</span>
          <h1 className="text-3xl font-bold text-gray-900">You&apos;re in!</h1>
          <p className="max-w-[280px] text-sm leading-relaxed text-gray-600">
            Everything is unlocked from day one — lessons, the Feed, opportunities,
            ambassadors. Time to start building your future.
          </p>

          <button
            type="button"
            disabled={saving}
            onClick={handleFinish}
            className="w-full rounded-full bg-[#1A1A2E] py-4 text-base font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            {saving ? "Getting ready..." : "Let's go 🚀"}
          </button>
        </div>
      )}
    </main>
  );
}
