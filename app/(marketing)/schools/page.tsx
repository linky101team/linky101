import type { Metadata } from "next";
import { FadeIn } from "@/components/landing/Animate";
import { MarketingNav, MarketingFooter } from "@/components/landing/MarketingShell";
import { CARD, SCHOOL_MAILTO } from "@/components/landing/marketingStyles";

/**
 * The schools page.
 *
 * A careers lead reads this with a safeguarding hat on, so every claim here
 * is one that survives being checked. The Gatsby wording says "designed to
 * support" rather than "covered", because a benchmark is met by a school's
 * provision, not by a supplier saying so — and Benchmark 8 is described as
 * what LinkY101 actually does (a mentor panel answering in writing) rather
 * than the 1:1 matching the waitlist page promised and the product has never
 * had.
 */

export const metadata: Metadata = {
  title: "LinkY101 — for schools and colleges",
  description:
    "Enterprise and careers provision your students will actually open. Designed to support Gatsby Benchmarks 2, 5, 6 and 8. Free pilots running this term.",
};

const BENCHMARKS = [
  {
    bm: "BM 2",
    emoji: "📊",
    tone: "bg-[#FECDD3]",
    title: "Learning from career and labour market information",
    body: "Pupils see real builders, real businesses and real routes in — including people who didn't take the university one.",
  },
  {
    bm: "BM 5",
    emoji: "🤝",
    tone: "bg-[#BBF7D0]",
    title: "Encounters with employers and employees",
    body: "Founders, business owners and a careers lead answering pupils' questions in writing, all year, without you booking a single assembly.",
  },
  {
    bm: "BM 6",
    emoji: "🏫",
    tone: "bg-[#A5F3FC]",
    title: "Experiences of workplaces",
    body: "Pupils build and share something of their own, and get it critiqued by people who do that work for a living.",
  },
  {
    bm: "BM 8",
    emoji: "🧭",
    tone: "bg-[#F5C518]",
    title: "Personal guidance",
    body: "A pupil's question goes to the whole mentor panel and comes back answered by whoever has actually done that thing. It supports your guidance — it doesn't replace a careers adviser.",
  },
];

const WHAT_YOU_GET = [
  {
    icon: "📚",
    tone: "bg-[#FECDD3]",
    title: "Lessons that need no prep",
    body: "Short, card-by-card lessons on ideas, customers, pricing and money. Nothing to plan, nothing to mark.",
  },
  {
    icon: "🎙️",
    tone: "bg-[#BBF7D0]",
    title: "A podcast worth putting on",
    body: "Real founder conversations you can play in form time or an enterprise club.",
  },
  {
    icon: "🤝",
    tone: "bg-[#F5C518]",
    title: "The mentor panel",
    body: "Your pupils can ask working business people the things they'd never put their hand up for.",
  },
  {
    icon: "🛡️",
    tone: "bg-[#A5F3FC]",
    title: "Safeguarding-first by design",
    body: "No direct messages anywhere, every answer read by a named adult before publication, and nothing visible to the public internet.",
  },
];

export default function SchoolsPage() {
  return (
    <main className="min-h-screen bg-[#DBEAFE] text-[#0F172A]">
      <MarketingNav />

      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_90%_0%,#F3E3FA_0%,#DBEAFE_45%)] px-5 pb-20 pt-16 lg:px-12">
        <span className="absolute right-16 top-14 hidden rotate-[10deg] text-[56px] lg:block">
          🎓
        </span>
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <span className="mb-7 inline-block rounded-full border-[2.5px] border-[#0F172A] bg-[#F5C518] px-5 py-2.5 text-[13px] font-extrabold tracking-wide">
              FOR SCHOOLS &amp; CAREERS LEADERS
            </span>
          </FadeIn>
          <FadeIn index={1}>
            <h1 className="max-w-[900px] text-[34px] font-extrabold leading-[1.12] tracking-tight sm:text-[46px] lg:text-[56px]">
              Careers provision your students{" "}
              <mark className="bg-[#BBF7D0] px-1.5 text-[#0F172A]">actually open.</mark>
            </h1>
          </FadeIn>
          <FadeIn index={2}>
            <p className="mt-7 max-w-[680px] text-[17px] leading-relaxed text-[#475569]">
              LinkY101 is designed to support the{" "}
              <b className="text-[#0F172A]">Gatsby Benchmarks</b> for careers education —
              real employer encounters and genuine enterprise experience, with no
              planning, no marking and no burnout for your team. 💙
            </p>
          </FadeIn>
          <FadeIn index={3}>
            <a
              href={SCHOOL_MAILTO}
              className="mt-8 inline-block rounded-full border-[2.5px] border-[#0F172A] bg-[#0F172A] px-7 py-4 text-[15.5px] font-extrabold text-[#F5C518] transition-transform hover:-translate-y-0.5"
            >
              Ask about a free pilot →
            </a>
          </FadeIn>
        </div>
      </section>

      <section className="px-5 py-24 text-center lg:px-12">
        <FadeIn>
          <span className="mb-6 inline-flex items-center gap-2 rounded-[20px] border-[2.5px] border-[#0F172A] bg-[#FECDD3] px-5 py-2 text-[13px] font-extrabold tracking-wide">
            DESIGNED AROUND THE BENCHMARKS ✅
          </span>
          <h2 className="text-[30px] font-extrabold tracking-tight sm:text-[42px]">
            Where it fits your provision 📋
          </h2>
        </FadeIn>

        <div className="mx-auto mt-12 grid max-w-[980px] gap-6 text-left md:grid-cols-2">
          {BENCHMARKS.map((b, i) => (
            <FadeIn key={b.bm} index={i}>
              <div className={`h-full px-8 py-8 ${b.tone} ${CARD}`}>
                <div className="mb-5 flex items-center justify-between">
                  <span className="rounded-[20px] border-2 border-[#0F172A] bg-white px-4 py-1.5 text-[13px] font-extrabold">
                    {b.bm}
                  </span>
                  <span className="text-[26px]">{b.emoji}</span>
                </div>
                <h3 className="text-[21px] font-extrabold leading-snug">{b.title}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-[#1E293B]">{b.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="bg-[#0F172A] px-5 py-24 lg:px-12">
        <div className="mx-auto max-w-[980px]">
          <FadeIn>
            <span className="mb-6 inline-block rounded-[20px] bg-[#F5C518] px-5 py-2.5 text-[12.5px] font-extrabold tracking-wide text-[#0F172A]">
              WHAT SCHOOLS GET
            </span>
            <h2 className="mb-12 text-[30px] font-extrabold leading-tight tracking-tight text-white sm:text-[42px]">
              Everything you need. <span className="text-[#F5C518]">Nothing you don&apos;t.</span>
            </h2>
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-2">
            {WHAT_YOU_GET.map((c, i) => (
              <FadeIn key={c.title} index={i}>
                <div className={`h-full rounded-3xl px-8 py-8 ${c.tone}`}>
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[20px]">
                    {c.icon}
                  </span>
                  <h3 className="text-[19px] font-extrabold text-[#0F172A]">{c.title}</h3>
                  <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#1E293B]">{c.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-b-[2.5px] border-[#0F172A] bg-[radial-gradient(circle_at_0%_0%,#FBE6C7_0%,#DBEAFE_40%,#D3F5DF_100%)] px-5 py-24 text-center lg:px-12">
        <span className="absolute left-14 top-11 hidden text-[44px] lg:block">🏫</span>
        <span className="absolute bottom-10 right-20 hidden text-[46px] lg:block">🎉</span>
        <FadeIn>
          <h2 className="text-[32px] font-extrabold leading-tight tracking-tight sm:text-[46px]">
            Bring LinkY101
            <br />
            to <mark className="bg-[#F5C518] px-2 text-[#0F172A]">your school.</mark>
          </h2>
          <p className="mx-auto mt-5 max-w-[520px] text-[16px] leading-relaxed text-[#475569]">
            Tell us your school and your role and we&apos;ll send back exactly what a
            pilot involves — including the safeguarding detail your DSL will want.
          </p>
          <a
            href={SCHOOL_MAILTO}
            className="mt-8 inline-block rounded-full border-[2.5px] border-[#0F172A] bg-[#0F172A] px-8 py-4 text-[16px] font-extrabold text-[#F5C518] transition-transform hover:-translate-y-0.5"
          >
            Email us →
          </a>
          <p className="mt-4 text-sm font-bold text-[#92400E]">linky101team@gmail.com</p>
        </FadeIn>
      </section>

      <MarketingFooter />
    </main>
  );
}
