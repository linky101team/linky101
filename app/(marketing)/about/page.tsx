import Link from "next/link";
import type { Metadata } from "next";
import { AMBASSADORS } from "@/lib/ambassadors";
import { FadeIn } from "@/components/landing/Animate";
import { MarketingNav, MarketingFooter } from "@/components/landing/MarketingShell";
import { CARD, BTN_DARK, AMBASSADOR_MAILTO } from "@/components/landing/marketingStyles";

/**
 * The story page.
 *
 * The waitlist version borrowed a named public figure's mission statement.
 * That's someone else's endorsement to give, so this says the same thing in
 * LinkY101's own words instead — which is stronger anyway, because the story
 * behind it is true and specific.
 */

export const metadata: Metadata = {
  title: "LinkY101 — our story",
  description:
    "Young people get locked out of the professional world before they even start. Every major network excludes them by age or by design. LinkY101 fixes that.",
};

const MISSION = [
  {
    tone: "bg-[#6EE7B7]",
    icon: "🛡️",
    title: "Safe, credible and open to anyone",
    body: "A place where a thirteen-year-old and a business owner can have a useful conversation, with the safeguarding built into the shape of it rather than bolted on afterwards.",
  },
  {
    tone: "bg-[#FECDD3]",
    icon: "📚",
    title: "The bit school doesn't cover",
    body: "How to find an idea, get a first customer, price something, handle the money. Practical, plainly written, and free for any UK school to plug into.",
  },
  {
    tone: "bg-[#F5C518]",
    icon: "🤝",
    title: "Access to people who've done it",
    body: "The whole point: a young founder gets a straight answer from someone who has actually run a business — without needing to already know them.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#DBEAFE] text-[#0F172A]">
      <MarketingNav />

      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_5%_0%,#F3D9E8_0%,#DBEAFE_45%)] px-5 pb-20 pt-16 lg:px-12">
        <span className="absolute right-20 top-14 hidden text-[52px] lg:block">💙</span>
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <span className="mb-7 inline-block rounded-full border-[2.5px] border-[#0F172A] bg-[#F5C518] px-5 py-2.5 text-[13px] font-extrabold tracking-wide">
              OUR STORY ✨
            </span>
          </FadeIn>
          <FadeIn index={1}>
            <h1 className="max-w-[820px] text-[36px] font-extrabold leading-[1.12] tracking-tight sm:text-[48px] lg:text-[60px]">
              Become someone,
              <br />
              <span className="bg-[linear-gradient(#6EE7B7,#6EE7B7)] bg-[length:100%_14px] bg-[position:0_92%] bg-no-repeat">
                before LinkedIn.
              </span>
            </h1>
          </FadeIn>
          <FadeIn index={2}>
            <p className="mt-7 max-w-[640px] text-[17px] leading-relaxed text-[#475569]">
              Young entrepreneurs get locked out of the professional world before they
              even start. LinkedIn won&apos;t take you until you&apos;re 16 and is
              written for people with a career behind them. Everything else aimed at
              teenagers is a social feed. LinkY101 fixes that.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="px-5 py-24 text-center lg:px-12">
        <FadeIn>
          <p className="mb-5 text-[40px]">🎯</p>
          <span className="mb-6 inline-block rounded-[20px] border-[2.5px] border-[#0F172A] bg-[#7DD3FC] px-5 py-2 text-[13px] font-extrabold tracking-wide">
            THE MISSION
          </span>
          <h2 className="text-[30px] font-extrabold tracking-tight sm:text-[44px]">
            Fix the infrastructure.{" "}
            <mark className="bg-[#F5C518] px-2 text-[#0F172A]">Fuel the talent.</mark>
          </h2>
          <p className="mx-auto mt-6 max-w-[760px] text-[17px] leading-relaxed text-[#475569]">
            The country isn&apos;t short of young people with ideas. It&apos;s short of
            the professional scaffolding to hold them up — the network, the answers and
            the first door. LinkY101 is being built to be that, and to be{" "}
            <b className="text-[#0F172A]">free for every 13&ndash;19 year old in the UK</b>.
          </p>
        </FadeIn>

        <div className="mx-auto mt-14 grid max-w-[1080px] gap-6 text-left md:grid-cols-3">
          {MISSION.map((m, i) => (
            <FadeIn key={m.title} index={i}>
              <div className={`h-full px-8 py-8 ${m.tone} ${CARD}`}>
                <p className="mb-4 text-[28px]">{m.icon}</p>
                <h3 className="text-[20px] font-extrabold leading-snug">{m.title}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-[#1E293B]">{m.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* THE SPARK — the story, told once, properly */}
      <section className="bg-[#0F172A] px-5 py-24 text-white lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2">
          <FadeIn from="left">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-[13px] font-bold">
              THE SPARK ✨
            </span>
            <h2 className="text-[30px] font-extrabold leading-tight tracking-tight sm:text-[42px]">
              One 14-year-old with a business idea and{" "}
              <span className="text-[#F5C518]">nowhere to go.</span>
            </h2>
          </FadeIn>
          <FadeIn from="right">
            <p className="text-[16px] leading-[1.7] text-[#CBD5E1]">
              Our founder went looking for a professional network she could join at 14
              and found that one didn&apos;t exist. Not a locked-down version of a
              grown-up one — nothing at all.
            </p>
            <p className="mt-5 text-[16px] leading-[1.7] text-[#CBD5E1]">
              So she started building it, and asked the people she wanted advice from
              whether they&apos;d help.{" "}
              <b className="text-white">{AMBASSADORS.length} of them said yes</b> — founders,
              investors, podcasters, a national careers leader — and their advice is on
              the platform under their own names.
            </p>
            <div className="mt-6 rounded-[20px] rounded-bl-[4px] bg-[#F5C518] px-7 py-6 text-[16.5px] font-bold leading-snug text-[#0F172A]">
              💛 &ldquo;LinkY101 is where you become someone. LinkedIn is where you show
              everyone you already are.&rdquo;
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="border-y-[2.5px] border-[#0F172A] bg-[radial-gradient(circle_at_0%_0%,#F3D9E8_0%,#DBEAFE_40%,#D3F5DF_100%)] px-5 py-24 text-center lg:px-12">
        <FadeIn>
          <h2 className="text-[32px] font-extrabold leading-tight tracking-tight sm:text-[46px]">
            Ready to{" "}
            <mark className="bg-[#F5C518] px-2 text-[#0F172A]">become someone?</mark> 🚀
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3.5">
            <Link href="/signup" className={BTN_DARK}>
              Join LinkY101 →
            </Link>
            <a
              href={AMBASSADOR_MAILTO}
              className="inline-block rounded-full border-[2.5px] border-[#0F172A] bg-white px-6 py-4 text-[15.5px] font-extrabold text-[#0F172A] transition-transform hover:-translate-y-0.5"
            >
              I&apos;d like to help
            </a>
          </div>
        </FadeIn>
      </section>

      <MarketingFooter />
    </main>
  );
}
