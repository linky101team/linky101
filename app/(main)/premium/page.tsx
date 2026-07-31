"use client";

import { useState, useTransition } from "react";
import { Check, Crown } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { isPremium } from "@/lib/premium";
import { startCheckout } from "@/lib/actions/premium";

const FEATURES = [
  {
    emoji: "🤝",
    tile: "bg-[#E3F2FD]",
    title: "1-on-1 mentor messaging",
    desc: "Message real founders and industry experts directly",
  },
  {
    emoji: "🤖",
    tile: "bg-[#F3E8FF]",
    title: "AI business coach",
    desc: "Instant answers on pricing, marketing and your next move",
  },
  {
    emoji: "🎤",
    tile: "bg-[#FFF0F0]",
    title: "Pitch deck reviews",
    desc: "Get real feedback on your pitch before the big moment",
  },
  {
    emoji: "📄",
    tile: "bg-[#E8F5E9]",
    title: "CV & portfolio builder",
    desc: "Turn everything you do on LinkY101 into a CV that stands out",
  },
  {
    emoji: "🎓",
    tile: "bg-[#FFF8E1]",
    title: "Exclusive workshops",
    desc: "Live masterclasses with founders who've actually done it",
  },
  {
    emoji: "⚡",
    tile: "bg-[#E1F5FE]",
    title: "Early access to opportunities",
    desc: "See new competitions and placements before anyone else",
  },
  {
    emoji: "👑",
    tile: "bg-[#FFF7DB]",
    title: "Pro badge",
    desc: "Stand out across the Feed and your profile",
  },
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
    <div className="flex flex-col gap-5 pb-16">
      <div className="rounded-2xl bg-[#1A1A2E] p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFD93D]">
          <Crown className="h-7 w-7 text-[#1A1A2E]" strokeWidth={2.5} />
        </div>
        <h1 className="mt-3 text-2xl font-extrabold text-white">
          LinkY101 <span className="text-[#FFD93D]">Pro</span>
        </h1>
        <p className="mx-auto mt-1.5 max-w-[280px] text-sm leading-relaxed text-white/70">
          Everything you need to go from idea to income.
        </p>
      </div>

      {alreadyPremium && (
        <div className="rounded-2xl border border-[#FFD93D] bg-[#FFF7DB] p-4 text-center">
          <p className="font-bold text-[#B8860B]">👑 You&apos;re already Pro!</p>
          {profile?.premium_until && (
            <p className="mt-1 text-xs font-semibold text-gray-500">
              Renews {new Date(profile.premium_until).toLocaleDateString("en-GB")}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {FEATURES.map((f) => (
          <div key={f.title} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${f.tile}`}>
              {f.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900">{f.title}</p>
              <p className="text-xs leading-snug text-gray-500">{f.desc}</p>
            </div>
            <Check className="h-4 w-4 shrink-0 text-[#2ECC71]" strokeWidth={3} />
          </div>
        ))}
      </div>

      {!alreadyPremium && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPlan("monthly")}
              className={`rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98] ${
                plan === "monthly" ? "border-[#1A1A2E] bg-white shadow-sm" : "border-gray-200 bg-white"
              }`}
            >
              <p className="text-xs font-bold text-gray-500">Monthly</p>
              <p className="mt-1 text-xl font-extrabold text-gray-900">£4.99</p>
              <p className="text-xs text-gray-400">per month</p>
            </button>

            <button
              type="button"
              onClick={() => setPlan("yearly")}
              className={`relative rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98] ${
                plan === "yearly" ? "border-[#1A1A2E] bg-white shadow-sm" : "border-gray-200 bg-white"
              }`}
            >
              <span className="absolute -top-2.5 right-3 rounded-full bg-[#2ECC71] px-2 py-0.5 text-[10px] font-bold text-white">
                SAVE 50%
              </span>
              <p className="text-xs font-bold text-gray-500">Yearly</p>
              <p className="mt-1 text-xl font-extrabold text-gray-900">£29.99</p>
              <p className="text-xs text-gray-400">£2.50/month · best value</p>
            </button>
          </div>

          {errorMsg && <p className="text-center text-sm font-semibold text-[#FF6B6B]">{errorMsg}</p>}

          <button
            type="button"
            disabled={loading}
            onClick={handleUpgrade}
            className="w-full rounded-full bg-[#1A1A2E] py-4 text-base font-bold text-white shadow-sm transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            {loading ? "Redirecting..." : "Unlock Pro ✨"}
          </button>

          <p className="-mt-2 text-center text-xs font-semibold text-gray-400">
            Cancel anytime · No hidden fees
          </p>
        </>
      )}

      <p className="text-center text-xs leading-relaxed text-gray-400">
        👨‍👩‍👧 A parent or guardian should be involved in any purchase. Subscriptions can be
        cancelled anytime from Settings.
      </p>
    </div>
  );
}
