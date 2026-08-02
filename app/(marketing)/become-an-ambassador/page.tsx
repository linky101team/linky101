import type { Metadata } from "next";
import { AMBASSADORS, ambassadorAvatar } from "@/lib/ambassadors";
import { FadeIn } from "@/components/landing/Animate";
import { MarketingNav, MarketingFooter } from "@/components/landing/MarketingShell";
import { CARD, AMBASSADOR_MAILTO } from "@/components/landing/marketingStyles";

/**
 * The ambassador page.
 *
 * Ambassadors and mentors are two different things and this page must never
 * blur them. An ambassador shares their story and one piece of advice
 * publicly, under their own name, and never has private contact with a member
 * — they are not DBS-checked and nothing here claims they are. Mentors are
 * hand-picked, DBS-checked, and invited directly, which is why there is no
 * public "apply to be a mentor" page anywhere on the site.
 *
 * Layout is the three numbered cards from the original waitlist site. The
 * content is not: that version sold roundtable dinners, hackathons, bursaries,
 * 1:1 chats and ESG impact reporting, none of which exist. The people reading
 * this are real, named, findable business owners who would notice.
 */

export const metadata: Metadata = {
  title: "LinkY101 — become an ambassador",
  description:
    "Share one honest piece of advice with 13–19 year olds building something. Public, under your own name, no calls and no private messaging.",
};

const CARDS = [
  {
    num: "01",
    tone: "bg-[#BBF7D0]",
    tick: "bg-[#DCFCE7]",
    emoji: "✨",
    eyebrow: "WHAT AN AMBASSADOR DOES",
    title: "One honest piece of advice, in your own words",
    body: "Your story and the one thing you wish someone had told you at fifteen. It sits on your profile where any member can read it — no calls, nothing in your diary, no ongoing commitment.",
    points: [
      "Your story: what you do and how you got there",
      "One piece of advice, published under your name",
      "You approve the wording before anything goes live",
      "Take it down again any time, with one message",
      "Never any private contact with a young person",
    ],
  },
  {
    num: "02",
    tone: "bg-[#FECDD3]",
    tick: "bg-[#FEE2E6]",
    emoji: "📣",
    eyebrow: "WHO YOU'D REACH",
    title: "13–19 year olds actually building something",
    body: "Verified young people across the UK — at school, at college, or homeschooled and signing up on their own. Most of them have never met anyone who has run a business.",
    points: [
      "Every member is a verified 13–19 year old",
      "No anonymous accounts, on either side",
      "Your profile sits in the directory every member browses",
      "They see the route in, not just the job title",
      "Nothing is visible to the public internet",
    ],
  },
  {
    num: "03",
    tone: "bg-[#A5F3FC]",
    tick: "bg-[#CFFAFE]",
    emoji: "💙",
    eyebrow: "WHAT YOU GET BACK",
    title: "Be the person a 14-year-old finds first",
    body: "Ten minutes of your time, once, reaching people at exactly the moment it changes what they think is possible. You'd be on the platform from the beginning, while it's still being built.",
    points: [
      "Founding Ambassador status from day one",
      "A profile with your photo, role and LinkedIn",
      "Your advice in front of the next generation",
      "Direct sight of what teenagers are actually building",
      "Ten minutes that someone remembers for years",
    ],
  },
];

const VETTING = [
  {
    icon: "🪪",
    title: "Who we list",
    body: "Founders, business owners, investors and educators who've done the work. Real, named, findable people — no pseudonyms and no anonymous adults.",
  },
  {
    icon: "✅",
    title: "What we check",
    body: "You pass an over-18 verification step before you're listed, and we confirm your professional background matches the profile.",
  },
  {
    icon: "🚫",
    title: "What you'll never be asked for",
    body: "Private messages with a young person. Ambassadors never contact members directly — that feature doesn't exist on LinkY101 and isn't going to.",
  },
];

export default function BecomeAnAmbassadorPage() {
  const faces = AMBASSADORS.slice(0, 8);

  return (
    <main className="min-h-screen bg-[#DBEAFE] text-[#0F172A]">
      <MarketingNav />

      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_92%_0%,#F3E3FA_0%,#DBEAFE_45%)] px-5 pb-20 pt-16 lg:px-12">
        <span className="absolute right-16 top-16 hidden text-[54px] lg:block">🎓</span>
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <span className="mb-7 inline-flex items-center rounded-full border-[2.5px] border-[#0F172A] bg-[#F5C518] px-5 py-2.5 text-[13px] font-extrabold tracking-wide">
              AMBASSADORS · VERIFIED 18+
            </span>
          </FadeIn>
          <FadeIn index={1}>
            <h1 className="max-w-[860px] text-[34px] font-extrabold leading-[1.12] tracking-tight sm:text-[46px] lg:text-[56px]">
              Ten minutes, once.{" "}
              <mark className="bg-[#BBF7D0] px-2 text-[#0F172A]">
                The advice nobody gave you at 15.
              </mark>
            </h1>
          </FadeIn>
          <FadeIn index={2}>
            <p className="mt-7 max-w-[640px] text-[17px] leading-relaxed text-[#475569]">
              LinkY101 ambassadors share their story and one honest piece of advice with
              young people building something real. It&apos;s public, it&apos;s under
              your own name, and there&apos;s no calls, no diary and no private
              messaging. 💙
            </p>
          </FadeIn>
          <FadeIn index={3}>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <a
                href={AMBASSADOR_MAILTO}
                className="inline-block rounded-full border-[2.5px] border-[#0F172A] bg-[#0F172A] px-7 py-4 text-[15.5px] font-extrabold text-[#F5C518] transition-transform hover:-translate-y-0.5"
              >
                Put yourself forward →
              </a>
              <div className="flex items-center gap-3.5">
                <div className="flex">
                  {faces.map((a, i) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      key={a.id}
                      src={ambassadorAvatar(a.id)}
                      alt={a.name}
                      className={`h-9 w-9 rounded-full border-[3px] border-[#DBEAFE] object-cover ${
                        i === 0 ? "" : "-ml-2.5"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[14.5px] font-semibold text-[#334155]">
                  {AMBASSADORS.length} have already said yes.
                </p>
              </div>
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
              HOW IT WORKS
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

          <FadeIn>
            <p className="mx-auto mt-12 max-w-[720px] text-center text-[14.5px] leading-relaxed text-[#94A3B8]">
              Ambassadors are different from mentors. Mentors answer members&apos;
              questions directly, are DBS-checked, and are invited rather than applied
              for — which is why there&apos;s no form for it here.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="bg-[radial-gradient(circle_at_0%_0%,#F3D9E8_0%,#DBEAFE_40%,#D3F5DF_100%)] px-5 py-24 text-center lg:px-12">
        <FadeIn>
          <h2 className="text-[32px] font-extrabold leading-tight tracking-tight sm:text-[44px]">
            Be the person a{" "}
            <mark className="bg-[#F5C518] px-2 text-[#0F172A]">14-year-old finds first.</mark>
          </h2>
          <p className="mx-auto mt-5 max-w-[540px] text-[16px] leading-relaxed text-[#475569]">
            Send us your name, what you do and your LinkedIn. We&apos;ll come back with
            the two questions we ask everyone, and that&apos;s the whole process.
          </p>
          <a
            href={AMBASSADOR_MAILTO}
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
