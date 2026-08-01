"use client";

import Link from "next/link";
import {
  Sparkles,
  Wrench,
  Star,
  Briefcase,
  MessageCircleQuestion,
  MapPin,
} from "lucide-react";
import SearchBar from "@/components/discover/SearchBar";
import TutorialPrompt from "@/components/TutorialPrompt";
import { Reveal, LiftCard } from "@/components/ui/Reveal";
import AmbassadorGrid from "@/components/discover/AmbassadorGrid";
import { UK_REGIONS } from "@/lib/regions";

const HUB = [
  {
    href: "/mentors",
    icon: Star,
    label: "Ambassadors",
    body: "Real founders sharing one hard-won lesson each",
    tint: "bg-[#F3E8FF]",
    color: "#7C3AED",
  },
  {
    href: "/dreams",
    icon: Sparkles,
    label: "Dream Wall",
    body: "Post your idea — top 50 each month win an event",
    tint: "bg-[#FCE7F3]",
    color: "#EC4899",
  },
  {
    href: "/tools",
    icon: Wrench,
    label: "Founder Tools",
    body: "Validate your idea and build a pitch deck",
    tint: "bg-[#CFFAFE]",
    color: "#06B6D4",
  },
  {
    href: "/opportunities",
    icon: Briefcase,
    label: "Opportunities",
    body: "Real competitions and programmes across the UK",
    tint: "bg-[#FEF3C7]",
    color: "#B45309",
  },
];

export default function DiscoverPage() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Reveal>
        <div>
          <h1 className="text-2xl font-extrabold text-[#1E1B4B]">Discover 🧭</h1>
          <p className="text-sm text-gray-500">Ask anything, find people, get your idea moving</p>
        </div>
      </Reveal>

      <div data-tour="discover-search">
        <SearchBar />
      </div>

      {/* Ask LinkY AI — the headline action on this page */}
      <Reveal index={1}>
        <LiftCard>
          <Link href="/discover?section=ask" className="grad-hero block rounded-3xl p-5">
            <div className="flex items-center gap-2">
              <MessageCircleQuestion className="h-5 w-5 text-white" strokeWidth={2.5} />
              <p className="text-lg font-extrabold text-white">Ask LinkY AI</p>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-white/85">
              Any business question — pricing, marketing, where to start. You get an answer straight away, and
              the 20 most-voted questions get answered properly every Monday at 9AM.
            </p>
            <span className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-sm font-bold text-[#7C3AED]">
              Ask a question →
            </span>
          </Link>
        </LiftCard>
      </Reveal>

      {/* Hub tiles */}
      <div className="grid grid-cols-2 gap-3">
        {HUB.map((item, i) => (
          <Reveal key={item.href} index={i}>
            <LiftCard>
              <Link
                href={item.href}
                className="flex h-full flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.tint}`}>
                  <item.icon className="h-5 w-5" style={{ color: item.color }} strokeWidth={2.25} />
                </span>
                <span className="text-sm font-extrabold text-[#1E1B4B]">{item.label}</span>
                <span className="text-xs leading-relaxed text-gray-500">{item.body}</span>
              </Link>
            </LiftCard>
          </Reveal>
        ))}
      </div>

      {/* Regions */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[#7C3AED]" strokeWidth={2.5} />
          <h2 className="font-extrabold text-[#1E1B4B]">Browse by region</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {UK_REGIONS.map((region) => (
            <Link
              key={region}
              href={`/mentors?region=${encodeURIComponent(region)}`}
              className="rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-600 transition-colors hover:border-[#7C3AED] hover:text-[#7C3AED]"
            >
              {region}
            </Link>
          ))}
        </div>
      </section>

      {/* Ambassadors — full card grid with sector and region filters */}
      <section data-tour="discover-founders">
        <Reveal>
          <div className="grad-hero mb-4 rounded-2xl p-5">
            <h2 className="text-xl font-extrabold text-white">Meet the Ambassadors</h2>
            <p className="mt-1 text-sm text-white/85">
              Real founders from across the UK and beyond — filter by what they do or where they are
            </p>
          </div>
        </Reveal>

        <AmbassadorGrid />

        <Link
          href="/mentors"
          className="mt-4 block rounded-2xl border border-gray-200 bg-white py-3 text-center text-sm font-bold text-[#7C3AED]"
        >
          Ask them a question →
        </Link>
      </section>

      <TutorialPrompt tourId="discover" />
    </div>
  );
}
