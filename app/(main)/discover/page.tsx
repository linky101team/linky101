"use client";

import Link from "next/link";
import {
  ChevronRight,
  Target,
  Megaphone,
  PiggyBank,
  Wrench,
  Palette,
  Rocket,
  Briefcase,
  Building2,
  Cpu,
  Mic,
} from "lucide-react";
import SearchBar from "@/components/discover/SearchBar";
import TutorialPrompt from "@/components/TutorialPrompt";
import { Reveal, LiftCard } from "@/components/ui/Reveal";
import { AMBASSADORS } from "@/lib/ambassadors";

const TOPICS = [
  { key: "Pitch Decks", icon: Target, bg: "bg-[#FFF0F0]", color: "#FF6B6B" },
  { key: "Marketing", icon: Megaphone, bg: "bg-[#E3F2FD]", color: "#039BE5" },
  { key: "Finance", icon: PiggyBank, bg: "bg-[#E8F5E9]", color: "#2ECC71" },
  { key: "Tools", icon: Wrench, bg: "bg-[#F3E8FF]", color: "#7C3AED" },
  { key: "Branding", icon: Palette, bg: "bg-[#FFF8E1]", color: "#B8860B" },
  { key: "Start Up", icon: Rocket, bg: "bg-[#E1F5FE]", color: "#0288D1" },
];

const OPPORTUNITY_SPOTLIGHT = [
  {
    icon: Briefcase,
    tile: "bg-[#FFF8E1]",
    color: "#B8860B",
    title: "Tycoon Enterprise Competition",
    org: "Peter Jones Foundation",
    chip: "Closes Sept",
  },
  {
    icon: Building2,
    tile: "bg-[#E8F5E9]",
    color: "#2ECC71",
    title: "Work Experience Placements",
    org: "Speakers for Schools",
    chip: "Rolling",
  },
  {
    icon: Cpu,
    tile: "bg-[#E3F2FD]",
    color: "#039BE5",
    title: "TeenTech Awards",
    org: "TeenTech",
    chip: "Ages 11–18",
  },
];

export default function DiscoverPage() {
  return (
    <div className="flex flex-col gap-6 pb-16">
      <div>
        <h1 className="text-lg font-bold text-gray-900">Discover</h1>
        <p className="text-sm text-gray-500">Find people, topics and your next big opportunity</p>
      </div>

      <div data-tour="discover-search">
        <SearchBar />
      </div>

      <section data-tour="discover-opportunities">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">🚀 Opportunities</h2>
          <Link href="/opportunities" className="text-sm font-semibold text-[#039BE5]">
            See all ›
          </Link>
        </div>
        <div className="flex flex-col gap-2.5">
          {OPPORTUNITY_SPOTLIGHT.map((opp, i) => (
            <Reveal key={opp.title} index={i}>
              <LiftCard>
                <Link
                  href="/opportunities"
                  className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm"
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${opp.tile}`}>
                    <opp.icon className="h-5 w-5" style={{ color: opp.color }} strokeWidth={2.25} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900">{opp.title}</p>
                    <p className="text-xs text-gray-500">{opp.org}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                    {opp.chip}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
                </Link>
              </LiftCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section data-tour="discover-topics">
        <h2 className="mb-3 font-bold text-gray-900">🧭 Browse topics</h2>
        <div className="grid grid-cols-3 gap-3">
          {TOPICS.map((t, i) => (
            <Reveal key={t.key} index={i}>
              <LiftCard>
                <Link
                  href={`/learn/topic/${encodeURIComponent(t.key)}`}
                  className={`flex flex-col items-center gap-2 rounded-2xl p-4 text-center shadow-sm ${t.bg}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70">
                    <t.icon className="h-5 w-5" style={{ color: t.color }} strokeWidth={2.25} />
                  </div>
                  <span className="text-xs font-bold leading-tight text-gray-900">{t.key}</span>
                </Link>
              </LiftCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section data-tour="discover-founders">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">🌟 Ambassadors</h2>
          <Link href="/mentors" className="text-sm font-semibold text-[#039BE5]">
            Meet them all ›
          </Link>
        </div>
        <div className="flex flex-col gap-2.5">
          {AMBASSADORS.slice(0, 2).map((a, i) => (
            <Reveal key={a.id} index={i}>
              <LiftCard>
                <Link
                  href="/mentors"
                  className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm"
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: a.color }}
                  >
                    {a.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900">{a.name}</p>
                    <p className="truncate text-xs text-gray-500">{a.role}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
                </Link>
              </LiftCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section>
        <LiftCard>
          <Link
            href="/learn?tab=podcasts"
            className="flex items-center gap-3 rounded-2xl bg-[#1A1A2E] p-4"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10">
              <Mic className="h-5 w-5 text-[#FFD93D]" strokeWidth={2.25} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-white">The LinkY101 Podcast</p>
              <p className="text-xs text-white/60">Real young founders, real stories</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-white/50" />
          </Link>
        </LiftCard>
      </section>

      <TutorialPrompt tourId="discover" />
    </div>
  );
}
