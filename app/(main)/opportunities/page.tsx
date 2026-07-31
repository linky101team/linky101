"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { toggleSaveOpportunity, toggleAppliedOpportunity } from "@/lib/actions/opportunities";
import OpportunityCard, { type Opportunity } from "@/components/opportunities/OpportunityCard";

const CATEGORIES = [
  { value: "all", label: "All", active: "bg-[#1A1A2E] text-white" },
  { value: "competition", label: "🏆 Competitions", active: "bg-[#FFC107] text-gray-900" },
  { value: "work_experience", label: "💼 Work Experience", active: "bg-[#039BE5] text-white" },
  { value: "grant", label: "💰 Funding", active: "bg-[#2ECC71] text-white" },
  { value: "mentorship", label: "🤝 Mentorship", active: "bg-[#7C3AED] text-white" },
  { value: "event", label: "📅 Events", active: "bg-[#FF6B6B] text-white" },
];

interface FeaturedOpportunity {
  id: string;
  emoji: string;
  tile: string;
  title: string;
  org: string;
  blurb: string;
  category: string;
  categoryChip: { bg: string; text: string; label: string };
  ages: string;
  deadline: string | null;
  link: string;
}

const FEATURED: FeaturedOpportunity[] = [
  {
    id: "feat-tycoon",
    emoji: "💼",
    tile: "bg-[#FFF8E1]",
    title: "Tycoon Enterprise Competition",
    org: "Peter Jones Foundation",
    blurb: "Get a real startup loan, run a business for 4 weeks and keep the profit you make. The UK's biggest schools business competition.",
    category: "competition",
    categoryChip: { bg: "bg-[#FFF8E1]", text: "text-[#B8860B]", label: "Competition" },
    ages: "Ages 11–18",
    deadline: "Closes Sept",
    link: "https://www.peterjonesfoundation.org/",
  },
  {
    id: "feat-teentech",
    emoji: "🤖",
    tile: "bg-[#E3F2FD]",
    title: "TeenTech Awards",
    org: "TeenTech",
    blurb: "Design technology that makes life better — judged by real industry experts, with a royal awards ceremony for winners.",
    category: "competition",
    categoryChip: { bg: "bg-[#FFF8E1]", text: "text-[#B8860B]", label: "Competition" },
    ages: "Ages 11–18",
    deadline: null,
    link: "https://www.teentech.com/",
  },
  {
    id: "feat-ye",
    emoji: "🚀",
    tile: "bg-[#FFF0F0]",
    title: "Company Programme",
    org: "Young Enterprise",
    blurb: "Set up and run a real student company for a whole year — with trade fairs, real customers and real money.",
    category: "work_experience",
    categoryChip: { bg: "bg-[#E3F2FD]", text: "text-[#039BE5]", label: "Programme" },
    ages: "Ages 15–19",
    deadline: null,
    link: "https://www.young-enterprise.org.uk/",
  },
  {
    id: "feat-sfs",
    emoji: "🏢",
    tile: "bg-[#E8F5E9]",
    title: "Work Experience Placements",
    org: "Speakers for Schools",
    blurb: "Free placements with some of the UK's biggest employers — apply online, no connections needed.",
    category: "work_experience",
    categoryChip: { bg: "bg-[#E3F2FD]", text: "text-[#039BE5]", label: "Work Experience" },
    ages: "Ages 14–19",
    deadline: "Rolling",
    link: "https://www.speakersforschools.org/",
  },
  {
    id: "feat-springpod",
    emoji: "📱",
    tile: "bg-[#F3E8FF]",
    title: "Virtual Work Experience",
    org: "Springpod",
    blurb: "Try careers at big-name companies from your phone — medicine, engineering, business, media and more.",
    category: "work_experience",
    categoryChip: { bg: "bg-[#E3F2FD]", text: "text-[#039BE5]", label: "Work Experience" },
    ages: "Ages 13–19",
    deadline: "Rolling",
    link: "https://www.springpod.com/",
  },
  {
    id: "feat-kings-trust",
    emoji: "💷",
    tile: "bg-[#E8F5E9]",
    title: "Enterprise Programme",
    org: "The King's Trust",
    blurb: "Free courses, mentoring and funding support to help you launch your own business.",
    category: "grant",
    categoryChip: { bg: "bg-[#E8F5E9]", text: "text-[#2ECC71]", label: "Funding" },
    ages: "Ages 16+",
    deadline: "Rolling",
    link: "https://www.kingstrust.org.uk/",
  },
];

function FeaturedCard({ opp }: { opp: FeaturedOpportunity }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${opp.tile}`}>
          {opp.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold leading-snug text-gray-900">{opp.title}</h3>
          <p className="text-xs font-semibold text-gray-500">{opp.org}</p>
        </div>
      </div>

      <p className="mt-2.5 text-sm leading-relaxed text-gray-600">{opp.blurb}</p>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${opp.categoryChip.bg} ${opp.categoryChip.text}`}>
          {opp.categoryChip.label}
        </span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">{opp.ages}</span>
        {opp.deadline && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
            📆 {opp.deadline}
          </span>
        )}
      </div>

      <a
        href={opp.link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block rounded-full bg-[#1A1A2E] py-2 text-center text-sm font-bold text-white transition-transform active:scale-[0.98]"
      >
        View →
      </a>
    </div>
  );
}

interface SavedRow {
  opportunity_id: string;
  has_applied: boolean;
}

export default function OpportunitiesPage() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);

  const [category, setCategory] = useState("all");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [savedMap, setSavedMap] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!profile) return;

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
  }, [profile, supabase]);

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

  const filteredFeatured = FEATURED.filter((o) => category === "all" || o.category === category);
  const filteredDb = opportunities.filter((o) => category === "all" || o.category === category);

  return (
    <div className="flex flex-col gap-5 pb-16">
      <div>
        <h1 className="text-lg font-bold text-gray-900">Opportunities</h1>
        <p className="text-sm text-gray-500">Competitions, placements and funding — made for your age group</p>
      </div>

      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCategory(c.value)}
            className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
              category === c.value ? `${c.active} shadow-sm` : "border border-gray-200 bg-white text-gray-500"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filteredFeatured.map((opp) => (
          <FeaturedCard key={opp.id} opp={opp} />
        ))}
      </div>

      {!loading && filteredDb.length > 0 && (
        <>
          <h2 className="mt-1 font-bold text-gray-900">More opportunities</h2>
          <div className="flex flex-col gap-3">
            {filteredDb.map((o) => (
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
        </>
      )}

      {filteredFeatured.length === 0 && filteredDb.length === 0 && !loading && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <span className="text-4xl">🎯</span>
          <p className="mt-2 font-bold text-gray-900">Nothing in this category yet</p>
          <p className="text-sm text-gray-500">New opportunities are added all the time — check back soon.</p>
        </div>
      )}
    </div>
  );
}
