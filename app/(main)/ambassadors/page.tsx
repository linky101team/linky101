"use client";

import Link from "next/link";
import AmbassadorGrid from "@/components/discover/AmbassadorGrid";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Ambassadors and mentors used to share one page, which made the difference
 * between them invisible — and that difference matters here. Ambassadors are
 * founders sharing their story publicly; mentors are DBS-checked adults you
 * can put a question to. Separate pages, separate promises.
 */
export default function AmbassadorsPage() {
  return (
    <div className="flex flex-col gap-5 pb-16">
      <Reveal>
        <div>
          <h1 className="text-2xl font-extrabold text-[#1E1B4B]">Ambassadors ⭐</h1>
          <p className="text-sm text-gray-500">
            Real founders sharing one hard-won lesson each
          </p>
        </div>
      </Reveal>

      <AmbassadorGrid />

      <Reveal>
        <div className="grad-gold rounded-2xl border border-[#F59E0B]/40 p-5">
          <p className="font-extrabold text-[#92400E]">💡 Become an Ambassador</p>
          <p className="mt-1 text-sm leading-relaxed text-[#92400E]">
            Give ten minutes of your story and inspire the next generation of founders.
          </p>
          <Link
            href="/feedback"
            className="mt-3 inline-block rounded-full bg-[#1E1B4B] px-5 py-2 text-sm font-bold text-white transition-transform active:scale-95"
          >
            Get in touch →
          </Link>
        </div>
      </Reveal>

      <Reveal>
        <Link
          href="/mentors"
          className="block rounded-2xl border border-[#10B981]/40 bg-[#D1FAE5] p-5 transition-transform active:scale-[0.99]"
        >
          <p className="font-extrabold text-[#065F46]">🛡️ Looking for a mentor?</p>
          <p className="mt-1 text-sm leading-relaxed text-[#047857]">
            DBS-checked adults you can ask anything — the best questions get answered
            publicly every week.
          </p>
          <span className="mt-3 inline-block text-sm font-bold text-[#065F46]">
            See the mentors →
          </span>
        </Link>
      </Reveal>
    </div>
  );
}
