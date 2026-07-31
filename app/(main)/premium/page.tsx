"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { isPremium } from "@/lib/premium";
import { startCheckout } from "@/lib/actions/premium";
import GameCard from "@/components/ui/GameCard";
import GradientButton from "@/components/ui/GradientButton";
import SectionTitle from "@/components/ui/SectionTitle";

const FEATURES = [
  { emoji: "🧠", label: "Exclusive quizzes" },
  { emoji: "✨", label: "Premium flair" },
  { emoji: "🤝", label: "Priority mentor access" },
  { emoji: "📊", label: "Post analytics" },
  { emoji: "🎡", label: "2 daily spins" },
  { emoji: "🚀", label: "Early access to new features" },
  { emoji: "🎓", label: "Monthly live masterclass" },
];

export default function PremiumPage() {
  const { profile } = useProfile();
  const [plan, setPlan] = useState<"monthly" | "yearly">("yearly");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const alreadyPremium = isPremium(profile);

  function handleUpgrade() {
    setErrorMsg(null);
    setLoading(true);
    startTransition(async () => {
      try {
        const url = await startCheckout(plan);
        window.location.href = url;
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Couldn't start checkout right now");
        setLoading(false);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[18px] border-3 border-pink bg-gradient-pink-purple p-6 text-center shadow-glow-pink">
        <p className="text-3xl">✨</p>
        <h1 className="heading-game mt-2 text-2xl text-ink">Go Premium</h1>
        <p className="mt-1 text-sm font-bold text-ink/90">
          Level up faster with exclusive tools built for young founders.
        </p>
      </div>

      {alreadyPremium && (
        <GameCard borderColor="yellow" glowColor="yellow" className="text-center">
          <p className="font-black uppercase text-yellow">✨ You&apos;re already Premium!</p>
          {profile?.premium_until && (
            <p className="mt-1 text-xs font-bold text-text-muted">
              Renews {new Date(profile.premium_until).toLocaleDateString()}
            </p>
          )}
        </GameCard>
      )}

      <div>
        <SectionTitle emoji="⚔️" title="Free vs Premium" className="mb-3" />
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[18px] border-3 border-border bg-card p-4">
            <p className="mb-3 text-center text-xs font-black uppercase text-text-muted">Free</p>
            <div className="flex flex-col gap-2">
              {FEATURES.map((f) => (
                <div key={f.label} className="flex items-center gap-2 text-xs font-bold text-text-muted">
                  <X className="h-3.5 w-3.5 shrink-0 text-orange" strokeWidth={3} />
                  <span className="line-through opacity-60">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[18px] border-3 border-yellow bg-card p-4 shadow-glow-yellow">
            <p className="mb-3 text-center text-xs font-black uppercase text-yellow">✨ Premium</p>
            <div className="flex flex-col gap-2">
              {FEATURES.map((f) => (
                <div key={f.label} className="flex items-center gap-2 text-xs font-bold text-ink">
                  <Check className="h-3.5 w-3.5 shrink-0 text-green" strokeWidth={3} />
                  <span>
                    {f.emoji} {f.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {!alreadyPremium && (
        <>
          <div className="flex gap-2 rounded-xl border-3 border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setPlan("monthly")}
              className={`flex-1 rounded-lg py-3 text-center text-xs font-black uppercase ${
                plan === "monthly" ? "bg-gradient-pink-purple text-white" : "text-text-muted"
              }`}
            >
              Monthly
              <span className="block text-sm font-black">£3.99/mo</span>
            </button>
            <button
              type="button"
              onClick={() => setPlan("yearly")}
              className={`flex-1 rounded-lg py-3 text-center text-xs font-black uppercase ${
                plan === "yearly" ? "bg-gradient-pink-purple text-white" : "text-text-muted"
              }`}
            >
              Yearly <span className="text-green">save 37%</span>
              <span className="block text-sm font-black">£29.99/yr</span>
            </button>
          </div>

          {errorMsg && <p className="text-center text-sm font-bold text-orange">{errorMsg}</p>}

          <GradientButton variant="pink" size="lg" className="w-full" disabled={loading} onClick={handleUpgrade}>
            {loading ? "Redirecting..." : "Upgrade Now ✨"}
          </GradientButton>
        </>
      )}

      <p className="text-center text-xs font-bold text-text-muted">
        👨‍👩‍👧 A parent or guardian should be involved in any purchase. Subscriptions can be cancelled
        anytime from Settings.
      </p>
    </div>
  );
}
