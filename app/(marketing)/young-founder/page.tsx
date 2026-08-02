import Link from "next/link";
import type { Metadata } from "next";
import { FadeIn } from "@/components/landing/Animate";
import { MarketingNav, MarketingFooter } from "@/components/landing/MarketingShell";
import { CARD, BTN_DARK, BTN_OUTLINE } from "@/components/landing/marketingStyles";

/**
 * The 13–15 lane.
 *
 * The waitlist version promised things the product doesn't do — private
 * mentor matching, an investor signal. What's listed here is only what a
 * member actually gets on the day they sign up, because the first person to
 * check will be a parent.
 */

export const metadata: Metadata = {
  title: "LinkY101 — Young Founder (13–15)",
  description:
    "You don't need to wait until you're 18 to build something real. A safe, verified space for school-age builders to share what they're making and ask people who've done it.",
};

const BENEFITS = [
  {
    icon: "💬",
    title: "Real feedback, fast",
    body: "Put what you're building on the Dream Wall and get reactions and comments from mentors and other young founders — not just likes from strangers.",
  },
  {
    icon: "🤝",
    title: "Ask people who've done it",
    body: "One question goes to the whole mentor panel — business owners, a principal, a careers lead. They answer properly, in writing, and you get a notification when they do.",
  },
  {
    icon: "📚",
    title: "Learn how it actually works",
    body: "Short lessons on finding an idea, first customers, pricing and money — written for someone who's fourteen, not for an MBA.",
  },
  {
    icon: "🎙️",
    title: "Founder stories, not highlight reels",
    body: "The podcast: the first £100, the thing that flopped, what they'd do differently. Listen on the way to school.",
  },
  {
    icon: "🏆",
    title: "Build a track record",
    body: "Your profile becomes proof of what you've built — worth having when you're applying for sixth form, work experience or anything after.",
  },
  {
    icon: "🛡️",
    title: "No adults in your DMs",
    body: "There are no DMs on LinkY101 at all. Every mentor answer is read by a named adult before you see it.",
  },
];

export default function YoungFounderPage() {
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
              AGES 13–15 · YOUNG FOUNDER
            </span>
          </FadeIn>
          <FadeIn index={1}>
            <h1 className="max-w-[760px] text-[34px] font-extrabold leading-[1.12] tracking-tight sm:text-[46px] lg:text-[56px]">
              You don&apos;t need to wait until you&apos;re 18 to{" "}
              <mark className="bg-[#F5C518] px-2 text-[#0F172A]">build something real.</mark>
            </h1>
          </FadeIn>
          <FadeIn index={2}>
            <p className="mt-7 max-w-[600px] text-[17px] leading-relaxed text-[#475569]">
              You&apos;ve got the idea and the drive. LinkY101 gives school-age builders
              a safe, verified space to share what you&apos;re making, get real feedback,
              and ask mentors who&apos;ve done it before.
            </p>
          </FadeIn>
          <FadeIn index={3}>
            <div className="mt-8 flex flex-wrap gap-3.5">
              <Link href="/signup" className={BTN_DARK}>
                Join as a Young Founder →
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
            Built for builders aged 13&ndash;15
          </h2>
        </FadeIn>

        <div className="mx-auto mt-12 grid max-w-[1080px] gap-6 text-left md:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => (
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
        <p className="mx-auto max-w-[680px] text-[16px] leading-relaxed text-[#CBD5E1]">
          Safeguarding isn&apos;t a setting on LinkY101 — it&apos;s the foundation.{" "}
          <b className="text-[#F5C518]">
            There are no private messages anywhere on the platform
          </b>
          , and every mentor answer is read by a named adult before it reaches you.
        </p>
      </section>

      <section className="bg-[radial-gradient(circle_at_0%_0%,#FBD7E0_0%,#DBEAFE_40%,#D3F5DF_100%)] px-5 py-24 text-center lg:px-12">
        <FadeIn>
          <h2 className="text-[32px] font-extrabold tracking-tight sm:text-[44px]">
            Ready to{" "}
            <mark className="bg-[#F5C518] px-2 text-[#0F172A]">become someone?</mark>
          </h2>
          <p className="mt-4 text-[16px] text-[#475569]">
            Join the founding cohort of young founders on LinkY101.
          </p>
          <Link href="/signup" className={`${BTN_DARK} mt-8`}>
            Join as a Young Founder →
          </Link>
        </FadeIn>
      </section>

      <MarketingFooter />
    </main>
  );
}
