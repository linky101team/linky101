"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { isPremium } from "@/lib/premium";
import { setActiveFlair } from "@/lib/actions/flair";
import GameCard from "@/components/ui/GameCard";
import GradientButton from "@/components/ui/GradientButton";
import SectionTitle from "@/components/ui/SectionTitle";

const BORDER_STYLES = [
  { value: "static", label: "Classic" },
  { value: "pulse", label: "Pulse Glow" },
  { value: "spin", label: "Spinning Ring" },
];

const COLORS = [
  { value: "pink", label: "Pink", border: "border-pink", glow: "shadow-glow-pink", hex: "#ff6b9d" },
  { value: "sky", label: "Sky", border: "border-sky", glow: "shadow-glow-sky", hex: "#38bdf8" },
  { value: "purple", label: "Purple", border: "border-purple", glow: "shadow-glow-purple", hex: "#a78bfa" },
  { value: "yellow", label: "Yellow", border: "border-yellow", glow: "shadow-glow-yellow", hex: "#f5c518" },
  { value: "green", label: "Green", border: "border-green", glow: "shadow-glow-green", hex: "#4ade80" },
];

const BADGES = ["👑", "💎", "🌟", "🔥", "⚡", "🦄"];

const NAME_GRADIENTS = [
  { value: "pink-purple", label: "Pink → Purple", className: "bg-gradient-pink-purple" },
  { value: "sky-purple", label: "Sky → Purple", className: "bg-gradient-sky-purple" },
  { value: "purple-pink", label: "Purple → Pink", className: "bg-gradient-purple-pink" },
  { value: "yellow-orange", label: "Yellow → Orange", className: "bg-gradient-yellow-orange" },
  { value: "green-sky", label: "Green → Sky", className: "bg-gradient-green-sky" },
];

interface FlairState {
  streak_shields?: number;
  flair_count?: number;
  active_border?: string;
  active_color?: string;
  active_badge?: string;
  active_name_gradient?: string;
}

export default function FlairPage() {
  const { profile } = useProfile();
  const [border, setBorder] = useState("static");
  const [color, setColor] = useState("pink");
  const [badge, setBadge] = useState("👑");
  const [nameGradient, setNameGradient] = useState("pink-purple");
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const flair = (profile?.profile_flair as FlairState | undefined) ?? {};
  const unlocked = isPremium(profile) || (flair.flair_count ?? 0) > 0;

  useEffect(() => {
    if (profile && !initialized) {
      setBorder(flair.active_border ?? "static");
      setColor(flair.active_color ?? "pink");
      setBadge(flair.active_badge ?? "👑");
      setNameGradient(flair.active_name_gradient ?? "pink-purple");
      setInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  function handleSave() {
    setSaving(true);
    startTransition(async () => {
      try {
        await setActiveFlair(border, color, badge, nameGradient);
        setSavedMsg("Flair saved!");
        setTimeout(() => setSavedMsg(null), 2000);
      } finally {
        setSaving(false);
      }
    });
  }

  if (!profile) return <p className="text-sm font-bold text-text-muted">Loading...</p>;

  const activeColor = COLORS.find((c) => c.value === color) ?? COLORS[0];
  const activeGradient = NAME_GRADIENTS.find((g) => g.value === nameGradient) ?? NAME_GRADIENTS[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link href="/profile" className="text-text-muted" aria-label="Back to profile">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <SectionTitle emoji="✨" title="Premium Flair" />
      </div>

      {!unlocked ? (
        <GameCard borderColor="yellow" glowColor="yellow" className="flex flex-col items-center gap-3 text-center">
          <span className="text-3xl">🔒</span>
          <p className="font-black uppercase text-ink">Flair is a Premium perk</p>
          <p className="text-sm font-bold text-text-muted">
            Go Premium (or win a Profile Flair spin prize) to unlock custom borders, colours, and badges.
          </p>
          <Link href="/premium">
            <GradientButton variant="pink">Go Premium ✨</GradientButton>
          </Link>
        </GameCard>
      ) : (
        <>
          {/* Live preview */}
          <div className="flex flex-col items-center gap-3 rounded-[18px] border-3 border-border bg-card p-6">
            <div className="relative flex h-24 w-24 items-center justify-center">
              {border === "spin" && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(${activeColor.hex}, transparent, ${activeColor.hex})`,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              )}
              <div
                className={`relative flex h-20 w-20 items-center justify-center rounded-full border-4 bg-gradient-pink-purple text-2xl font-black text-white ${activeColor.border} ${activeColor.glow} ${
                  border === "pulse" ? "animate-pulse" : ""
                }`}
              >
                {profile.first_name.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-1 -right-1 text-xl">{badge}</span>
            </div>
            <p
              className={`heading-game bg-clip-text text-xl text-transparent ${activeGradient.className}`}
            >
              {profile.first_name}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-wide text-text-muted">Border Style</p>
            <div className="flex gap-2">
              {BORDER_STYLES.map((b) => (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => setBorder(b.value)}
                  className={`flex-1 rounded-xl border-3 py-2 text-xs font-black uppercase ${
                    border === b.value ? "border-pink bg-pink/10 text-white" : "border-border text-text-muted"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-wide text-text-muted">Colour</p>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  aria-label={c.label}
                  className={`h-9 w-9 rounded-full border-3 ${c.border} ${
                    color === c.value ? c.glow : ""
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-wide text-text-muted">Badge Icon</p>
            <div className="flex gap-2">
              {BADGES.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBadge(b)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border-3 text-lg ${
                    badge === b ? "border-pink bg-pink/10" : "border-border"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-wide text-text-muted">Name Gradient</p>
            <div className="flex flex-col gap-2">
              {NAME_GRADIENTS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setNameGradient(g.value)}
                  className={`rounded-xl border-3 p-2 text-left text-xs font-black uppercase ${
                    nameGradient === g.value ? "border-pink" : "border-border"
                  }`}
                >
                  <span className={`bg-clip-text text-sm text-transparent ${g.className}`}>{g.label}</span>
                </button>
              ))}
            </div>
          </div>

          <GradientButton variant="pink" size="lg" disabled={saving} onClick={handleSave}>
            {saving ? "Saving..." : "Save Flair"}
          </GradientButton>
          {savedMsg && <p className="text-center text-xs font-bold text-green">{savedMsg}</p>}
        </>
      )}
    </div>
  );
}
