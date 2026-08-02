import type { Metadata } from "next";
import { FadeIn } from "@/components/landing/Animate";
import { MarketingNav, MarketingFooter } from "@/components/landing/MarketingShell";
import { CARD } from "@/components/landing/marketingStyles";

/**
 * The safeguarding page.
 *
 * The waitlist version said "DMs between under-18s and adult mentors follow
 * strict rules". LinkY101 has no DMs at all — which is a stronger position,
 * and the difference matters to the one reader who checks. Everything here
 * describes a decision already built into the product, not an intention.
 */

export const metadata: Metadata = {
  title: "LinkY101 — safeguarding",
  description:
    "No direct messages anywhere. Every mentor answer read by a named adult before publication. How LinkY101 keeps 13–19 year olds safe.",
};

const CARDS = [
  {
    tone: "bg-[#6EE7B7]",
    icon: "🚫",
    title: "No direct messages. Anywhere.",
    body: "There is nowhere on LinkY101 for an adult to message a young person privately, and no private inbox between members either. It isn't a setting that can be switched on — the feature doesn't exist.",
  },
  {
    tone: "bg-[#FB7185]",
    icon: "🕵️",
    title: "Mentors are checked first",
    body: "Every mentor is approved before they can answer anything. They're real, named, findable people with a professional background we've verified — no pseudonyms, no anonymous adults.",
  },
  {
    tone: "bg-[#F5C518]",
    icon: "👀",
    title: "Every answer is read before it lands",
    body: "Questions go to the whole mentor panel, and a named adult reads each answer before it reaches the young person who asked. Anything published to the weekly feed has the asker's name removed.",
  },
  {
    tone: "bg-[#7DD3FC]",
    icon: "🚨",
    title: "Report anything, fast",
    body: "Every profile and post has a one-tap report. We respond quickly, and we work with schools, parents and the authorities where that's what's needed.",
  },
];

export default function SafeguardingPage() {
  return (
    <main className="min-h-screen bg-[#DBEAFE] text-[#0F172A]">
      <MarketingNav />

      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_8%_0%,#D3F5DF_0%,#DBEAFE_45%)] px-5 pb-20 pt-16 lg:px-12">
        <span className="absolute right-16 top-20 hidden text-[56px] lg:block">🛡️</span>
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <span className="mb-7 inline-block rounded-full border-[2.5px] border-[#0F172A] bg-[#F5C518] px-5 py-2.5 text-[13px] font-extrabold tracking-wide">
              SAFEGUARDING
            </span>
          </FadeIn>
          <FadeIn index={1}>
            <h1 className="max-w-[820px] text-[32px] font-extrabold leading-[1.14] tracking-tight sm:text-[44px] lg:text-[56px]">
              A{" "}
              <span className="bg-[linear-gradient(#6EE7B7,#6EE7B7)] bg-[length:100%_14px] bg-[position:0_92%] bg-no-repeat">
                serious network.
              </span>{" "}
              Taken <mark className="bg-[#F5C518] px-2 text-[#0F172A]">seriously.</mark>
            </h1>
          </FadeIn>
          <FadeIn index={2}>
            <p className="mt-7 max-w-[640px] text-[17px] leading-relaxed text-[#475569]">
              LinkY101 is for 13&ndash;19 year olds, and adults are on it only to answer
              questions. Safeguarding isn&apos;t a setting here — it&apos;s the shape of
              the product. 🕊️
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="px-5 py-20 lg:px-12">
        <div className="mx-auto grid max-w-[1080px] gap-6 md:grid-cols-2">
          {CARDS.map((c, i) => (
            <FadeIn key={c.title} index={i}>
              <div className={`h-full px-8 py-8 ${c.tone} ${CARD}`}>
                <p className="mb-4 text-[30px]">{c.icon}</p>
                <h3 className="text-[20px] font-extrabold">{c.title}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-[#1E293B]">{c.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <div className="mx-auto mt-6 grid max-w-[1080px] gap-6 md:grid-cols-2">
          <FadeIn>
            <div className={`h-full bg-[#C4B5FD] px-8 py-8 ${CARD}`}>
              <p className="mb-4 text-[30px]">🇬🇧</p>
              <h3 className="text-[20px] font-extrabold">UK-aligned by design</h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-[#1E293B]">
                We follow UK guidance for organisations working with young people,
                including age-appropriate design and collecting as little personal data
                as the platform can function on. Nothing on LinkY101 is visible to the
                public internet — it all sits behind a login.
              </p>
            </div>
          </FadeIn>

          <FadeIn index={1}>
            <div className={`h-full bg-white px-8 py-8 ${CARD}`}>
              <p className="mb-4 text-[30px]">💬</p>
              <h3 className="text-[20px] font-extrabold">We&apos;re not a support service</h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-[#475569]">
                LinkY101 is about building things, and we don&apos;t pretend to be
                anything else. If a young person raises something that needs real help,
                we say so plainly and point them to Childline on 0800 1111 or Shout
                (text SHOUT to 85258) rather than trying to handle it ourselves.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="bg-[#0F172A] px-5 py-24 text-center lg:px-12">
        <FadeIn>
          <span className="mb-8 inline-block rounded-[20px] bg-[#F5C518] px-6 py-2.5 text-[12.5px] font-extrabold tracking-wide text-[#0F172A]">
            OUR PROMISE
          </span>
          <h2 className="mx-auto max-w-[900px] text-[26px] font-extrabold leading-[1.35] text-white sm:text-[36px] lg:text-[42px]">
            If it isn&apos;t safe for a <span className="text-[#F5C518]">13-year-old</span>, it
            doesn&apos;t ship. Full stop.
          </h2>
        </FadeIn>
      </section>

      <MarketingFooter />
    </main>
  );
}
