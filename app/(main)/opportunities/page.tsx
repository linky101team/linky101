"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Lock } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { getXPForLevel, getXPToNextLevel } from "@/lib/levels";
import { toggleSaveOpportunity, toggleAppliedOpportunity } from "@/lib/actions/opportunities";
import SectionTitle from "@/components/ui/SectionTitle";
import OpportunityCard, { type Opportunity } from "@/components/opportunities/OpportunityCard";

const LEVEL_GATE = 10;

const CATEGORIES = [
  { value: "all", label: "All", emoji: "" },
  { value: "competition", label: "Competitions", emoji: "🏆" },
  { value: "grant", label: "Grants", emoji: "💰" },
  { value: "work_experience", label: "Work Experience", emoji: "💼" },
  { value: "mentorship", label: "Mentorship", emoji: "🤝" },
  { value: "event", label: "Events", emoji: "📅" },
  { value: "resource", label: "Resources", emoji: "📚" },
];

interface SavedRow {
  opportunity_id: string;
  has_applied: boolean;
}

export default function OpportunitiesPage() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);

  const [category, setCategory] = useState("all");
  const [tab, setTab] = useState<"browse" | "saved">("browse");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [savedMap, setSavedMap] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  const level = profile?.level ?? 1;
  const unlocked = level >= LEVEL_GATE;

  useEffect(() => {
    if (!profile || !unlocked) return;

    async function load() {
      const { data } = await supabase
        .from("opportunities")
        .select("id, title, description, category, age_min, age_max, deadline, link, location")
        .eq("is_active", true)
        .order("deadline", { ascending: true, nullsFirst: false });
      setOpportunities(data ?? []);

      const { data: saved } = await supabase
        .from("saved_opportunities")
        .select("opportunity_id, has_applied")
        .eq("user_id", profile!.id);

      const map = new Map<string, boolean>();
      (saved as SavedRow[] | null)?.forEach((s) => map.set(s.opportunity_id, s.has_applied));
      setSavedMap(map);
      setLoading(false);
    }
    load();
  }, [profile, unlocked, supabase]);

  function handleToggleSave(id: string) {
    const wasSaved = savedMap.has(id);
    setSavedMap((prev) => {
      const next = new Map(prev);
      if (wasSaved) next.delete(id);
      else next.set(id, false);
      return next;
    });
    startTransition(async () => {
      try {
        await toggleSaveOpportunity(id);
      } catch {
        setSavedMap((prev) => {
          const next = new Map(prev);
          if (wasSaved) next.set(id, false);
          else next.delete(id);
          return next;
        });
      }
    });
  }

  function handleToggleApplied(id: string) {
    const current = savedMap.get(id) ?? false;
    setSavedMap((prev) => new Map(prev).set(id, !current));
    startTransition(async () => {
      try {
        await toggleAppliedOpportunity(id);
      } catch {
        setSavedMap((prev) => new Map(prev).set(id, current));
      }
    });
  }

  if (!profile) {
    return <p className="text-sm font-bold text-text-muted">Loading...</p>;
  }

  if (!unlocked) {
    const xpNeeded = getXPToNextLevel(level, profile.xp) ?? Math.max(0, getXPForLevel(LEVEL_GATE) - profile.xp);
    return (
      <div className="relative min-h-[60vh] overflow-hidden">
        <div className="pointer-events-none select-none space-y-4 opacity-40 blur-sm">
          <div className="h-24 rounded-[18px] border-3 border-yellow bg-card" />
          <div className="h-24 rounded-[18px] border-3 border-green bg-card" />
          <div className="h-24 rounded-[18px] border-3 border-sky bg-card" />
          <div className="h-24 rounded-[18px] border-3 border-purple bg-card" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <Lock className="h-8 w-8 text-purple" strokeWidth={3} />
          <p className="heading-game text-xl">Opportunities Board</p>
          <p className="text-sm font-bold text-text-muted">Unlocks at Level {LEVEL_GATE}</p>
          <p className="rounded-full border-3 border-purple bg-card px-4 py-2 text-xs font-black uppercase text-purple shadow-glow-purple">
            You&apos;re Level {level} — {xpNeeded} XP to go!
          </p>
        </div>
      </div>
    );
  }

  const filtered = opportunities.filter((o) => category === "all" || o.category === category);
  const visible = tab === "saved" ? filtered.filter((o) => savedMap.has(o.id)) : filtered;

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle emoji="🎯" title="Opportunities" />

      <div className="flex gap-2 rounded-xl border-3 border-border bg-card p-1">
        {(["browse", "saved"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-xs font-black uppercase ${
              tab === t ? "bg-gradient-pink-purple text-white" : "text-text-muted"
            }`}
          >
            {t === "browse" ? "Browse" : `Saved (${savedMap.size})`}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCategory(c.value)}
            className={`shrink-0 whitespace-nowrap rounded-full border-3 px-3 py-1.5 text-xs font-black uppercase tracking-wide ${
              category === c.value
                ? "border-pink bg-gradient-pink-purple text-white shadow-glow-pink"
                : "border-border bg-card text-text-muted"
            }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm font-bold text-text-muted">Loading opportunities...</p>
      ) : visible.length === 0 ? (
        <p className="text-sm font-bold text-text-muted">
          {tab === "saved" ? "You haven't saved anything yet." : "No opportunities in this category yet."}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((o) => (
            <OpportunityCard
              key={o.id}
              opportunity={o}
              isSaved={savedMap.has(o.id)}
              hasApplied={savedMap.get(o.id) ?? false}
              onToggleSave={() => handleToggleSave(o.id)}
              onToggleApplied={() => handleToggleApplied(o.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
