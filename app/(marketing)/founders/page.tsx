import Link from "next/link";
import type { Metadata } from "next";
import { FadeIn } from "@/components/landing/Animate";
import { MarketingNav, MarketingFooter } from "@/components/landing/MarketingShell";
import {
  CARD,
  BTN_DARK,
  BTN_OUTLINE,
  WHATS_INSIDE,
} from "@/components/landing/marketingStyles";

/**
 * The member page — one lane, 13 to 19.
 *
 * There used to be two of these (Young Founder 13–15, Rising Founder 16–19).
 * They're merged because the product doesn't split that way: there is one
 * member type, everyone gets the same thing on day one, and splitting the
 * front door into tiers only made a fifteen-year-old wonder which half of the
 * platform they were being given. Homeschooled and self-taught builders
 * signing up on their own sit here too — you don't need a school to join.
 */

export const metadata: Metadata = {
  title: "LinkY101 — for founders aged 13–19",
  description:
    "You don't need to wait until you're 18 to build something real. Lessons, founder stories, and checked mentors who answer your questions properly. Free for 13–19 year olds in the UK.",
};

const EXTRAS = [
  {
    icon: "🏆",
    title: "Build a track record",
    body: "Your profile becomes proof of what you've built — worth having when you're applying for sixth form, college, work experience or anything after.",
  },
  {
    icon: "🧾",
    title: "The boring, essential stuff",
    body: "Bank accounts, invoices, tax, and what you can and can't sign before you're 18. The questions that stop people, answered plainly.",
  },
  {
    icon: "🛡️",
    title: "No adults in your DMs",
    body: "There are no DMs on LinkY101 at all. Questions go to the whole mentor panel, and every answer is read by a named adult before you see it.",
  },
];

export default function FoundersPage() {
  return (
    <main className="min-h-screen bg-[#DBEAFE] text-[#0F172A]">
      <MarketingNav />

      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_5%_0%,#FDE3EA_0%,#DBEAFE_45%)] px-5 pb-20 pt-16 lg:px-12">
        <span className="absolute right-16 top-16 hidden rotate-[20deg] text-[56px] lg:block">
          🚀
        </span>
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <span className="mb-7 inline-flex items-center rounded-full border-[2.5px] border-[#0F172A] bg-[#FECDD3] px-5 py-2.5 text-[13px] font-extrabold tracking-wide">
              AGES 13–19 · FOUNDERS
            </span>
          </FadeIn>
          <FadeIn index={1}>
            <h1 className="max-w-[820px] text-[34px] font-extrabold leading-[1.12] tracking-tight sm:text-[46px] lg:text-[56px]">
              You don&apos;t need to wait until you&apos;re 18 to{" "}
              <mark className="bg-[#F5C518] px-2 text-[#0F172A]">build something real.</mark>
            </h1>
          </FadeIn>
          <FadeIn index={2}>
            <p className="mt-7 max-w-[620px] text-[17px] leading-relaxed text-[#475569]">
              One network for every 13&ndash;19 year old in the UK who&apos;s building
              something, or wants to. At school, at college, or homeschooled and
              signing up on your own — same platform, same day one, nothing locked
              behind an age tier.
            </p>
          </FadeIn>
          <FadeIn index={3}>
            <div className="mt-8 flex flex-wrap gap-3.5">
              <Link href="/signup" className={BTN_DARK}>
                Create your profile →
              </Link>
              <Link href="/safeguarding" className={BTN_OUTLINE}>
                How we keep it safe
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="border-t border-[#0F172A]/10 px-5 py-24 text-center lg:px-12">
        <FadeIn>
          <span className="mb-6 inline-block rounded-[20px] border-[2.5px] border-[#0F172A] bg-[#BBF7D0] px-5 py-2 text-[12.5px] font-extrabold tracking-wide">
            WHAT YOU GET
          </span>
          <h2 className="text-[30px] font-extrabold tracking-tight sm:text-[42px]">
            Everything unlocks on day one
          </h2>
          <p className="mx-auto mt-4 max-w-[600px] text-[16.5px] leading-relaxed text-[#475569]">
            No jargon, no forty-minute videos, nothing aimed at people twice your age.
          </p>
        </FadeIn>

        <div className="mx-auto mt-12 grid max-w-[1080px] gap-6 text-left md:grid-cols-2">
          {WHATS_INSIDE.map((b, i) => (
            <FadeIn key={b.title} index={i}>
              <div className={`h-full px-8 py-8 ${b.tone} ${CARD}`}>
                <p className="mb-4 text-[28px]">{b.emoji}</p>
                <h3 className="text-[20px] font-extrabold">{b.title}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-[#1E293B]">{b.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <div className="mx-auto mt-6 grid max-w-[1080px] gap-6 text-left md:grid-cols-3">
          {EXTRAS.map((b, i) => (
            <FadeIn key={b.title} index={i}>
              <div className={`h-full bg-white px-7 py-8 ${CARD}`}>
                <p className="mb-4 text-[28px]">{b.icon}</p>
                <h3 className="text-[19px] font-extrabold">{b.title}</h3>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#475569]">{b.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="bg-[#0F172A] px-5 py-16 text-center lg:px-12">
        <p className="mx-auto max-w-[700px] text-[16px] leading-relaxed text-[#CBD5E1]">
          Safeguarding isn&apos;t a setting on LinkY101 — it&apos;s the foundation.{" "}
          <b className="text-[#F5C518]">
            There are no private messages anywhere on the platform
          </b>
          , every mentor answer is read by a named adult before it reaches you, and
          nothing here is visible to the public internet.
        </p>
      </section>

      <section className="bg-[radial-gradient(circle_at_0%_0%,#FBD7E0_0%,#DBEAFE_40%,#D3F5DF_100%)] px-5 py-24 text-center lg:px-12">
        <FadeIn>
          <h2 className="text-[32px] font-extrabold tracking-tight sm:text-[44px]">
            Ready to{" "}
            <mark className="bg-[#F5C518] px-2 text-[#0F172A]">become someone?</mark>
          </h2>
          <p className="mt-4 text-[16px] text-[#475569]">
            Free for 13&ndash;19 year olds across the UK. Joining takes about a minute.
          </p>
          <Link href="/signup" className={`${BTN_DARK} mt-8`}>
            Create your profile →
          </Link>
        </FadeIn>
      </section>

      <MarketingFooter />
    </main>
  );
}
