import type { Metadata } from "next";
import { AMBASSADORS } from "@/lib/ambassadors";
import { FadeIn } from "@/components/landing/Animate";
import { MarketingNav, MarketingFooter } from "@/components/landing/MarketingShell";
import { CARD, MENTOR_MAILTO } from "@/components/landing/marketingStyles";

/**
 * The mentor page.
 *
 * Layout is the three numbered cards from the original waitlist site, because
 * it reads well and Lucy asked for it. The content is not: the waitlist
 * version sold roundtable dinners, hackathons, bursaries, 1:1 chats and ESG
 * impact reporting, none of which exist. What's promised here is only what a
 * mentor is actually asked to do today — answer written questions from a
 * shared panel, a few minutes a week — because the people reading this are
 * real, named business owners who will notice the difference immediately.
 */

export const metadata: Metadata = {
  title: "LinkY101 — for mentors",
  description:
    "Answer written questions from 13–19 year olds building something, a few minutes a week, on your own schedule. No calls, no DMs, no scheduled sessions.",
};

const CARDS = [
  {
    num: "01",
    tone: "bg-[#BBF7D0]",
    tick: "bg-[#DCFCE7]",
    emoji: "✨",
    eyebrow: "WHAT YOU'D ACTUALLY DO",
    title: "Answer questions, in writing, when it suits you",
    body: "No calls, no scheduled sessions, nothing in your diary. Questions land with the whole mentor panel and you pick up the ones you've genuinely got something to say about.",
    points: [
      "A few minutes a week — genuinely",
      "Questions go to the panel, never to you alone",
      "Answer in writing, whenever you get a spare minute",
      "Skip anything that isn't your area, with no penalty",
      "Nothing is published until a named adult has read it",
    ],
  },
  {
    num: "02",
    tone: "bg-[#FECDD3]",
    tick: "bg-[#FEE2E6]",
    emoji: "📣",
    eyebrow: "WHO YOU'D REACH",
    title: "13–19 year olds actually building something",
    body: "Verified young people across the UK — at school, at college, or homeschooled and signing up on their own. The questions are the real ones they'd never put their hand up for in class.",
    points: [
      "Every member is a verified 13–19 year old",
      "No anonymous accounts, on either side",
      "Real questions: first customers, pricing, tax, confidence",
      "Your advice sits under your own name and photo",
      "The best answers go out to everyone in the weekly feed",
    ],
  },
  {
    num: "03",
    tone: "bg-[#A5F3FC]",
    tick: "bg-[#CFFAFE]",
    emoji: "💙",
    eyebrow: "WHAT YOU GET BACK",
    title: "Be the person a 14-year-old asks first",
    body: "Most young founders never get one honest answer from someone who's done it. You'd be that answer — and you'd be on the platform from the beginning, while it's still being built.",
    points: [
      "Founding Mentor status from day one",
      "A profile on LinkY101 in front of the next generation",
      "A record of every question you've answered",
      "Direct sight of what teenagers are actually building",
      "Ten minutes that someone remembers for years",
    ],
  },
];

const VETTING = [
  {
    icon: "🪪",
    title: "Who we take",
    body: "Founders, business owners, investors and educators who've done the thing young people are trying to do. Mentors are hand-picked rather than open sign-up.",
  },
  {
    icon: "✅",
    title: "What we check",
    body: "Identity, your professional background, and a DBS check before you're listed. No pseudonyms and no anonymous adults, ever.",
  },
  {
    icon: "🚫",
    title: "What you'll never be asked for",
    body: "Private messages with a young person. That feature doesn't exist on LinkY101 and isn't going to.",
  },
];

export default function ForMentorsPage() {
  return (
    <main className="min-h-screen bg-[#DBEAFE] text-[#0F172A]">
      <MarketingNav />

      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_92%_0%,#F3E3FA_0%,#DBEAFE_45%)] px-5 pb-20 pt-16 lg:px-12">
        <span className="absolute right-16 top-16 hidden text-[54px] lg:block">🤝</span>
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <span className="mb-7 inline-flex items-center rounded-full border-[2.5px] border-[#0F172A] bg-[#F5C518] px-5 py-2.5 text-[13px] font-extrabold tracking-wide">
              FOR MENTORS · VERIFIED 18+
            </span>
          </FadeIn>
          <FadeIn index={1}>
            <h1 className="max-w-[860px] text-[34px] font-extrabold leading-[1.12] tracking-tight sm:text-[46px] lg:text-[56px]">
              Ten minutes a week.{" "}
              <mark className="bg-[#BBF7D0] px-2 text-[#0F172A]">
                The answer nobody gave you at 15.
              </mark>
            </h1>
          </FadeIn>
          <FadeIn index={2}>
            <p className="mt-7 max-w-[640px] text-[17px] leading-relaxed text-[#475569]">
              LinkY101 mentors answer written questions from young people building real
              things. No calls, no diary, no DMs — you write when it suits you, and a
              named adult reads every answer before it goes anywhere. 💙
            </p>
          </FadeIn>
          <FadeIn index={3}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={MENTOR_MAILTO}
                className="inline-block rounded-full border-[2.5px] border-[#0F172A] bg-[#0F172A] px-7 py-4 text-[15.5px] font-extrabold text-[#F5C518] transition-transform hover:-translate-y-0.5"
              >
                Put yourself forward →
              </a>
              <p className="text-[14.5px] font-semibold text-[#334155]">
                {AMBASSADORS.length} founding ambassadors have already said yes.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="px-5 py-20 lg:px-12">
        <div className="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-3">
          {CARDS.map((c, i) => (
            <FadeIn key={c.num} index={i}>
              <div className={`flex h-full flex-col px-8 py-8 ${c.tone} ${CARD}`}>
                <div className="mb-5 flex items-center justify-between">
                  <span className="rounded-full border-2 border-[#0F172A] bg-white px-4 py-1.5 text-[13px] font-extrabold">
                    {c.num}
                  </span>
                  <span className="text-[24px]">{c.emoji}</span>
                </div>
                <p className="text-[12.5px] font-extrabold uppercase tracking-wide text-[#334155]">
                  {c.eyebrow}
                </p>
                <h3 className="mt-2 text-[22px] font-extrabold leading-tight">{c.title}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-[#334155]">{c.body}</p>
                <ul className="mt-5 flex flex-col gap-2.5">
                  {c.points.map((p) => (
                    <li
                      key={p}
                      className={`rounded-2xl border-2 border-[#0F172A] px-4 py-3 text-[14px] font-bold leading-snug ${c.tick}`}
                    >
                      ✓ {p}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="bg-[#0F172A] px-5 py-24 lg:px-12">
        <div className="mx-auto max-w-[1080px]">
          <FadeIn>
            <span className="mb-6 inline-block rounded-[20px] bg-[#F5C518] px-5 py-2.5 text-[12.5px] font-extrabold tracking-wide text-[#0F172A]">
              HOW WE VET
            </span>
            <h2 className="mb-12 text-[30px] font-extrabold leading-tight tracking-tight text-white sm:text-[42px]">
              Checked first. <span className="text-[#F5C518]">Every time.</span>
            </h2>
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-3">
            {VETTING.map((v, i) => (
              <FadeIn key={v.title} index={i}>
                <div className="h-full rounded-3xl bg-white px-7 py-8">
                  <p className="mb-4 text-[26px]">{v.icon}</p>
                  <h3 className="text-[19px] font-extrabold text-[#0F172A]">{v.title}</h3>
                  <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#475569]">{v.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[radial-gradient(circle_at_0%_0%,#F3D9E8_0%,#DBEAFE_40%,#D3F5DF_100%)] px-5 py-24 text-center lg:px-12">
        <FadeIn>
          <h2 className="text-[32px] font-extrabold leading-tight tracking-tight sm:text-[44px]">
            Be the person a{" "}
            <mark className="bg-[#F5C518] px-2 text-[#0F172A]">14-year-old asks first.</mark>
          </h2>
          <p className="mx-auto mt-5 max-w-[540px] text-[16px] leading-relaxed text-[#475569]">
            Tell us who you are and what you do. We&apos;ll come back with what the
            check involves and what the first month looks like.
          </p>
          <a
            href={MENTOR_MAILTO}
            className="mt-8 inline-block rounded-full border-[2.5px] border-[#0F172A] bg-[#0F172A] px-8 py-4 text-[16px] font-extrabold text-[#F5C518] transition-transform hover:-translate-y-0.5"
          >
            Put yourself forward →
          </a>
          <p className="mt-4 text-sm font-bold text-[#92400E]">linky101team@gmail.com</p>
        </FadeIn>
      </section>

      <MarketingFooter />
    </main>
  );
}
