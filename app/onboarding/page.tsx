"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfileStore } from "@/hooks/useProfile";
import { INTEREST_TAGS } from "@/lib/interests";
import GameCard from "@/components/ui/GameCard";
import GradientButton from "@/components/ui/GradientButton";
import Confetti from "@/components/Confetti";

const MIN_INTERESTS = 3;
const DREAM_MAX = 500;
const TUTORIAL_XP = 15;

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClientSupabase(), []);
  const { profile, fetchProfile, updateProfile } = useProfileStore();

  const [initializing, setInitializing] = useState(true);
  const [step, setStep] = useState(1);
  const [interests, setInterests] = useState<string[]>([]);
  const [dream, setDream] = useState("");
  const [taskDone, setTaskDone] = useState(false);
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

      if (profile) {
        await supabase.rpc("increment_xp", { user_id: profile.id, amount: TUTORIAL_XP });
      }

      await fetchProfile();
    })();

    await Promise.race([work, new Promise((resolve) => setTimeout(resolve, 1500))]);
    router.push("/home");
  }

  if (initializing) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="font-black uppercase text-text-muted">Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col gap-6 px-5 py-8">
      {step < 4 && (
        <div className="flex justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={`h-2 w-8 rounded-full ${
                s <= step ? "bg-gradient-pink-purple" : "bg-border"
              }`}
            />
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-1 flex-col gap-5">
          <div className="text-center">
            <h1 className="heading-game text-2xl">Pick Your Vibe</h1>
            <p className="mt-1 text-sm font-bold text-text-muted">
              Choose at least {MIN_INTERESTS} things you&apos;re into ({interests.length}/
              {INTEREST_TAGS.length})
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
                  className={`rounded-full border-3 px-4 py-2 text-xs font-black uppercase tracking-wide transition-colors ${
                    selected
                      ? "border-pink bg-gradient-pink-purple text-white shadow-glow-pink"
                      : "border-border bg-card text-text-muted"
                  }`}
                >
                  {tag}
                </motion.button>
              );
            })}
          </div>

          <div className="mt-auto">
            <GradientButton
              variant="pink"
              size="lg"
              className="w-full"
              disabled={interests.length < MIN_INTERESTS}
              onClick={() => setStep(2)}
            >
              Next
            </GradientButton>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-1 flex-col gap-5">
          <div className="text-center">
            <h1 className="heading-game text-2xl">What&apos;s Your Dream?</h1>
            <p className="mt-1 text-sm font-bold text-text-muted">
              What do you want to build one day? (optional)
            </p>
          </div>

          <GameCard borderColor="purple">
            <textarea
              value={dream}
              onChange={(e) => setDream(e.target.value.slice(0, DREAM_MAX))}
              placeholder="I want to launch my own..."
              rows={5}
              className="w-full resize-none bg-transparent font-bold text-ink placeholder:text-text-muted focus:outline-none"
            />
            <p className="mt-1 text-right text-xs font-bold text-text-muted">
              {dream.length}/{DREAM_MAX}
            </p>
          </GameCard>

          <div className="mt-auto flex flex-col gap-2">
            <GradientButton variant="purple" size="lg" className="w-full" onClick={() => setStep(3)}>
              Next
            </GradientButton>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="text-sm font-black uppercase tracking-wide text-text-muted"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-1 flex-col gap-5">
          <div className="text-center">
            <h1 className="heading-game text-2xl">Your First Task</h1>
            <p className="mt-1 text-sm font-bold text-text-muted">
              Here&apos;s a taste of how daily tasks work.
            </p>
          </div>

          <GameCard borderColor="sky" glowColor={taskDone ? "green" : undefined}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-black uppercase text-ink">
                  Say hi in the community feed
                </p>
                <p className="mt-1 text-xs font-bold text-text-muted">
                  Reply to today&apos;s intro post with one thing about you.
                </p>
              </div>
              <span className="shrink-0 rounded-full border-3 border-yellow bg-card px-2 py-1 text-xs font-black text-yellow shadow-glow-yellow">
                +{TUTORIAL_XP} XP
              </span>
            </div>

            <button
              type="button"
              onClick={() => setTaskDone(true)}
              disabled={taskDone}
              className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-3 py-3 font-black uppercase tracking-wide transition-colors ${
                taskDone
                  ? "border-green bg-green/20 text-green"
                  : "border-border bg-navy/60 text-ink"
              }`}
            >
              {taskDone ? (
                <>
                  <Check className="h-4 w-4" strokeWidth={3} /> Task Complete!
                </>
              ) : (
                "Mark as Done"
              )}
            </button>
          </GameCard>

          <div className="mt-auto">
            <GradientButton
              variant="sky"
              size="lg"
              className="w-full"
              disabled={!taskDone}
              onClick={() => setStep(4)}
            >
              Next
            </GradientButton>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="relative flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <Confetti />
          <span className="text-5xl">🎉</span>
          <h1 className="heading-game text-3xl">You&apos;re In!</h1>
          <p className="text-lg font-black uppercase text-pink">Welcome to Level 1!</p>
          <p className="text-sm font-bold text-text-muted">
            Time to start building your future.
          </p>

          <GradientButton
            variant="pink"
            size="lg"
            className="w-full"
            disabled={saving}
            onClick={handleFinish}
          >
            {saving ? "Getting Ready..." : "Let's Go"}
          </GradientButton>
        </div>
      )}
    </main>
  );
}
