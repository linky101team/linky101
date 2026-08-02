"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import type { Mentor } from "@/components/mentors/MentorCard";
import MentorGrid from "@/components/mentors/MentorGrid";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Just the mentors.
 *
 * Questions used to live at the bottom of this page, which turned it into one
 * endless scroll of people, then your questions, then the weekly feed. They
 * now have their own Ask page; this one is about who these people are.
 */
export default function MentorsPage() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    async function load() {
      // select("*") on purpose: a hand-written column list makes Supabase
      // reject the whole query with a 400 the moment one name is missing,
      // which renders as a silent "no mentors" instead of an error.
      const { data } = await supabase.from("mentors").select("*").eq("is_active", true);
      setMentors(data ?? []);
      setLoading(false);
    }
    load();
  }, [profile, supabase]);

  if (!profile) {
    return <p className="text-sm font-semibold text-gray-400">Loading...</p>;
  }

  return (
    <div className="flex flex-col gap-5 pb-16">
      <Reveal>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1E1B4B]">Mentors 🛡️</h1>
            <p className="text-sm text-gray-500">
              DBS-checked adults you can ask anything.
            </p>
          </div>
          <Link
            href="/ask"
            className="grad-brand hidden shrink-0 rounded-full px-4 py-2.5 text-sm font-bold text-white transition-transform active:scale-95 lg:block"
          >
            + Ask a question
          </Link>
        </div>
      </Reveal>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton-shimmer h-64 rounded-2xl" />
          ))}
        </div>
      ) : (
        <MentorGrid mentors={mentors} />
      )}

      <Reveal index={1}>
        <Link
          href="/ask"
          className="grad-brand block rounded-2xl p-5 transition-transform active:scale-[0.99]"
        >
          <p className="text-lg font-extrabold text-white">Got a question?</p>
          <p className="mt-0.5 text-sm leading-relaxed text-white/80">
            Ask all five at once. Your questions and their answers live on the Ask page.
          </p>
          <span className="mt-3 inline-block text-sm font-bold text-white">Go to Ask →</span>
        </Link>
      </Reveal>

      <Reveal index={2}>
        <Link
          href="/ambassadors"
          className="block rounded-2xl border border-[#F59E0B]/40 bg-[#FEF3C7] p-5 transition-transform active:scale-[0.99]"
        >
          <p className="font-extrabold text-[#92400E]">⭐ Meet the ambassadors</p>
          <p className="mt-1 text-sm leading-relaxed text-[#92400E]">
            Founders from across the UK sharing how they actually got started.
          </p>
          <span className="mt-3 inline-block text-sm font-bold text-[#92400E]">
            Browse ambassadors →
          </span>
        </Link>
      </Reveal>
    </div>
  );
}
