import Link from "next/link";
import type { Metadata } from "next";
import { FadeIn } from "@/components/landing/Animate";
import { MarketingNav, MarketingFooter } from "@/components/landing/MarketingShell";
import { CARD, BTN_DARK, BTN_OUTLINE } from "@/components/landing/marketingStyles";

/**
 * The 16–19 lane.
 *
 * The waitlist version sold investor visibility and 1:1 matching. Neither
 * exists, and promising them to someone who's actually trading is the fastest
 * way to lose them. This lists the real thing: a public profile, the mentor
 * panel, and the practical stuff nobody tells a seventeen-year-old.
 */

export const metadata: Metadata = {
  title: "LinkY101 — Rising Founder (16–19)",
  description:
    "Turning your idea into a real business? A network of DBS-checked mentors, founder stories and the practical answers nobody gives you at 17.",
};

const BENEFITS = [
  {
    icon: "📊",
    title: "Honest mentor feedback",
    body: "Drop what you're building on the Dream Wall and get straight reactions from people running real businesses — not encouragement, actual notes.",
  },
  {
    icon: "🤝",
    title: "The mentor panel",
    body: "Your question goes to every mentor at once, so you get the answer from whoever's actually done that thing, rather than whoever you happened to pick.",
  },
  {
    icon: "🧾",
    title: "The boring, essential stuff",
    body: "Bank accounts, invoices, tax and what you can and can't sign before you're 18. The questions that stop people, answered plainly.",
  },
  {
    icon: "🎙️",
    title: "Founders, unedited",
    body: "Long-form conversations about what the first year actually looked like — including the parts that don't make it onto a pitch deck.",
  },
  {
    icon: "🌍",
    title: "A profile worth linking to",
    body: "Somewhere to point a customer, a university or an employer that shows what you've built, not just what you've studied.",
  },
  {
    icon: "🔒",
    title: "Verified, and closed",
    body: "Everyone here is 13–19 or a checked adult, and nothing is visible to the public internet — it all sits behind a login.",
  },
];

export default function RisingFounderPage() {
  return (
    <main className="min-h-screen bg-[#DBEAFE] text-[#0F172A]">
      <MarketingNav />

      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_5%_0%,#D3F5DF_0%,#DBEAFE_45%)] px-5 pb-20 pt-16 lg:px-12">
        <span className="absolute right-16 top-16 hidden text-[52px] lg:block">💼</span>
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <span className="mb-7 inline-flex items-center rounded-full border-[2.5px] border-[#0F172A] bg-[#BBF7D0] px-5 py-2.5 text-[13px] font-extrabold tracking-wide">
              AGES 16–19 · RISING FOUNDER
            </span>
          </FadeIn>
          <FadeIn index={1}>
            <h1 className="max-w-[780px] text-[34px] font-extrabold leading-[1.12] tracking-tight sm:text-[46px] lg:text-[56px]">
              Turning your idea into a real business?{" "}
              <mark className="bg-[#F5C518] px-2 text-[#0F172A]">Don&apos;t do it alone.</mark>
            </h1>
          </FadeIn>
          <FadeIn index={2}>
            <p className="mt-7 max-w-[600px] text-[17px] leading-relaxed text-[#475569]">
              You&apos;re past the idea stage and building for real. LinkY101 connects
              sixth-form, college and first-job founders with checked mentors who have
              already run the thing you&apos;re running.
            </p>
          </FadeIn>
          <FadeIn index={3}>
            <div className="mt-8 flex flex-wrap gap-3.5">
              <Link href="/signup" className={BTN_DARK}>
                Join as a Rising Founder →
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
          <span className="mb-6 inline-block rounded-[20px] border-[2.5px] border-[#0F172A] bg-[#A5F3FC] px-5 py-2 text-[12.5px] font-extrabold tracking-wide">
            WHAT YOU GET
          </span>
          <h2 className="text-[30px] font-extrabold tracking-tight sm:text-[42px]">
            Built for founders aged 16&ndash;19
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
          LinkY101 is one network spanning ages 13&ndash;19 —{" "}
          <b className="text-[#F5C518]">every member is a real, verified young person</b>, so
          you&apos;re building alongside people who are exactly who they say they are.
        </p>
      </section>

      <section className="bg-[radial-gradient(circle_at_0%_0%,#D3F5DF_0%,#DBEAFE_40%,#FBD7E0_100%)] px-5 py-24 text-center lg:px-12">
        <FadeIn>
          <h2 className="text-[32px] font-extrabold tracking-tight sm:text-[44px]">
            Ready to{" "}
            <mark className="bg-[#F5C518] px-2 text-[#0F172A]">become someone?</mark>
          </h2>
          <p className="mt-4 text-[16px] text-[#475569]">
            Join the founding cohort of rising founders on LinkY101.
          </p>
          <Link href="/signup" className={`${BTN_DARK} mt-8`}>
            Join as a Rising Founder →
          </Link>
        </FadeIn>
      </section>

      <MarketingFooter />
    </main>
  );
}
