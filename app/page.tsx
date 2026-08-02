import Link from "next/link";
import type { Metadata } from "next";
import { AMBASSADORS, ambassadorAvatar } from "@/lib/ambassadors";
import { FadeIn, FloatIn, HoverLift } from "@/components/landing/Animate";
import { MarketingNav, MarketingFooter } from "@/components/landing/MarketingShell";
import {
  CARD,
  BTN_DARK,
  BTN_OUTLINE,
  SCHOOL_MAILTO,
  WHATS_INSIDE,
  SAFETY_POINTS,
} from "@/components/landing/marketingStyles";

/**
 * The front door.
 *
 * The waitlist design, rebuilt as the real thing: same soft blue ground, navy
 * outlines and hard shadows, but every button goes somewhere real and the
 * people on it come from `lib/ambassadors.ts`, so the page stays current as
 * more join instead of drifting into a list of invented names.
 *
 * It carries the full product detail rather than a teaser — what's actually
 * inside, who it's for, how safeguarding works, and how a school gets a pilot.
 * The page does two jobs at once: convince a fifteen-year-old this is for
 * them, and convince the adult standing behind them that it's safe. The second
 * job is the one most teen platforms skip, and it's the one a school checks
 * first.
 *
 * Three lanes, not four. LinkY101 has founders (13–19) and mentors (checked
 * adults) — there is no separate "rising founder" tier.
 *
 * Signed-in visitors never see this — middleware sends them straight to /home.
 */

export const metadata: Metadata = {
  title: "LinkY101 — your professional network, before LinkedIn",
  description:
    "The UK network for young people aged 13–19. Build a real profile, share what you're building, and ask checked mentors the things you're stuck on. Free across the UK.",
};

const LANES = [
  {
    href: "/founders",
    banner: "bg-[#FECDD3]",
    emoji: "🚀",
    badge: "AGES 13–19",
    title: "Founder",
    body: "Anyone 13–19 with an idea and the drive to build it — at school, at college, or homeschooled and signing up on your own.",
    cta: "Create your profile →",
    external: false,
  },
  {
    href: "/for-mentors",
    banner: "bg-[#FEF08A]",
    emoji: "🎓",
    badge: "VERIFIED · 18+",
    title: "Mentor",
    body: "Founders and business owners paying it forward. Written answers, a few minutes a week, whenever it suits you.",
    cta: "See what mentoring involves →",
    external: false,
  },
  {
    href: "/schools",
    banner: "bg-[#A5F3FC]",
    emoji: "🏫",
    badge: "SCHOOLS & COLLEGES",
    title: "School / College",
    body: "Enterprise and careers provision students actually open. Free pilots running this term.",
    cta: "Partner with us →",
    external: false,
  },
];

/**
 * The hero preview.
 *
 * The waitlist version used two invented members. Everyone on this one is
 * real: the spotlight is a genuine ambassador with their own photo, and the
 * question card is the Ask screen as it actually behaves — one question goes
 * to the whole mentor panel, and the answer comes back from a named adult.
 */
function HeroPreview() {
  const spotlight =
    AMBASSADORS.find((a) => a.id === "damian-hughes") ?? AMBASSADORS[0];

  return (
    <div className="space-y-6">
      <div className="relative rounded-[22px] bg-white shadow-[0_20px_45px_rgba(15,23,42,0.12)]">
        <div className="h-20 rounded-t-[22px] bg-gradient-to-r from-[#FDA4AF] via-[#FDE68A] to-[#86EFAC]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ambassadorAvatar(spotlight.id)}
          alt={spotlight.name}
          className="absolute left-6 top-14 h-16 w-16 rounded-full border-4 border-white object-cover"
        />
        <span className="absolute right-5 top-[92px] rounded-full bg-[#0F172A] px-4 py-2 text-[13px] font-extrabold text-[#F5C518]">
          Ambassador
        </span>
        <div className="px-6 pb-6 pt-11">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[17px] font-extrabold text-[#0F172A]">{spotlight.name}</span>
            <span className="text-[15px] text-[#F5C518]">✔</span>
          </div>
          <p className="mt-3 border-t border-[#0F172A]/10 pt-3 text-[15px] leading-snug text-[#334155]">
            {spotlight.role}
          </p>
          <div className="mt-3.5 flex flex-wrap gap-2 border-t border-[#0F172A]/10 pt-3.5">
            {spotlight.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-2xl bg-[#DBEAFE] px-3 py-1.5 text-[12.5px] font-bold text-[#1E3A5F]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="relative rounded-[22px] bg-white p-6 shadow-[0_20px_45px_rgba(15,23,42,0.10)]">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FECDD3] text-lg">
            💡
          </span>
          <div>
            <p className="text-[14.5px] font-extrabold text-[#0F172A]">
              Asked by a member{" "}
              <span className="font-semibold text-[#64748B]">· Year 11</span>
            </p>
            <p className="mt-0.5 text-[12.5px] text-[#64748B]">Sent to every mentor · 2h</p>
          </div>
        </div>
        <p className="mt-4 text-[15px] leading-relaxed text-[#334155]">
          I&apos;ve made 40 of something and nobody&apos;s bought one. How do I get
          my first actual customer?
        </p>
        <div className="mt-4 rounded-2xl bg-[#ECFDF5] p-4">
          <p className="text-[12px] font-extrabold uppercase tracking-wide text-[#047857]">
            Answered by a mentor
          </p>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#334155]">
            Ask ten people you already know. One of them says yes, and that&apos;s
            your first customer — it really is that unglamorous.
          </p>
        </div>
        <span className="absolute -bottom-4 right-6 rounded-2xl bg-[#F5C518] px-4 py-2 text-[13px] font-extrabold text-[#0F172A] shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
          ⭐ Rated helpful
        </span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  // Real faces, not stock photography. Proof beats promises on a page like this.
  const faces = AMBASSADORS.slice(0, 5);

  return (
    <main className="min-h-screen bg-[#DBEAFE] text-[#0F172A]">
      <MarketingNav />

      {/* HERO — copy left, the product itself on the right. */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_8%_0%,#F3E3FA_0%,#DBEAFE_42%)] px-5 pb-20 pt-14 lg:px-12">
        <div className="mx-auto grid max-w-6xl items-start gap-14 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <FadeIn>
              <span className="mb-7 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[13.5px] font-bold text-[#334155] shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
                ✨ The professional network for ages 13–19
              </span>
            </FadeIn>

            <FadeIn index={1}>
              <h1 className="text-[40px] font-extrabold leading-[1.08] tracking-tight sm:text-[52px] lg:text-[58px]">
                Your <span className="text-[#F5C518]">professional network</span>
                <br />— <span className="italic">before</span> LinkedIn.
              </h1>
            </FadeIn>

            <FadeIn index={2}>
              <p className="mt-6 max-w-[490px] text-[17px] leading-relaxed text-[#475569]">
                Build a real profile, share what you&apos;re building, and get answers
                from checked mentors and founders — in a network built only for young
                people.
              </p>
            </FadeIn>

            <FadeIn index={3}>
              <div className="mt-8 flex flex-wrap gap-3.5">
                <Link href="/signup" className={BTN_DARK}>
                  Create your profile →
                </Link>
                <Link href="/for-mentors" className={BTN_OUTLINE}>
                  Become a mentor
                </Link>
              </div>
            </FadeIn>

            <FadeIn index={4}>
              <div className="mt-9 flex flex-wrap items-center gap-3.5">
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
                <p className="text-[14.5px] text-[#334155]">
                  <b className="text-[#0F172A]">{AMBASSADORS.length} founding ambassadors</b> and
                  6 mentors already on board.
                </p>
              </div>
            </FadeIn>
          </div>

          <FloatIn>
            <HeroPreview />
          </FloatIn>
        </div>
      </section>

      {/* WHAT'S INSIDE — the actual product, not a promise about it */}
      <section className="border-t border-[#0F172A]/15 px-5 py-24 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <span className="mb-6 inline-block rounded-[20px] border-[2.5px] border-[#0F172A] bg-[#BBF7D0] px-5 py-2 text-[12.5px] font-extrabold tracking-wide">
              WHAT&apos;S INSIDE
            </span>
            <h2 className="max-w-[720px] text-[30px] font-extrabold tracking-tight sm:text-[42px]">
              Everything you need to start something, in one place
            </h2>
            <p className="mt-4 max-w-[560px] text-[16.5px] leading-relaxed text-[#475569]">
              No jargon, no forty-minute videos, nothing aimed at people twice your age.
            </p>
          </FadeIn>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {WHATS_INSIDE.map((f, i) => (
              <FadeIn key={f.title} index={i}>
                <HoverLift className="h-full">
                  <div className={`h-full px-8 py-8 ${f.tone} ${CARD}`}>
                    <p className="mb-4 text-[30px]">{f.emoji}</p>
                    <h3 className="text-[21px] font-extrabold leading-snug">{f.title}</h3>
                    <p className="mt-3 text-[14.5px] leading-relaxed text-[#1E293B]">{f.body}</p>
                  </div>
                </HoverLift>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* LANES */}
      <section className="border-t border-[#0F172A]/15 px-5 py-24 text-center lg:px-12">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <span className="mb-7 inline-block rounded-full bg-white px-5 py-2.5 text-[13.5px] font-bold text-[#334155] shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
              Pick your lane
            </span>
            <h2 className="text-[32px] font-extrabold tracking-tight sm:text-[42px]">
              One network. <span className="text-[#F5C518]">Three ways in.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-[620px] text-[16.5px] leading-relaxed text-[#475569]">
              Every mentor is checked before they can answer anything. Nothing on
              LinkY101 is visible to the public internet.
            </p>
          </FadeIn>

          <div className="mx-auto mt-14 grid max-w-[1080px] gap-6 text-left md:grid-cols-3">
            {LANES.map((lane, i) => {
              const inner = (
                <>
                  <div className={`relative h-24 border-b border-[#0F172A]/15 ${lane.banner}`}>
                    <span className="absolute right-5 top-4 text-[22px]">{lane.emoji}</span>
                    <span className="absolute left-6 top-[60px] flex h-[52px] w-[52px] items-center justify-center rounded-2xl border-4 border-white bg-[#0F172A] text-[22px]">
                      {lane.emoji}
                    </span>
                  </div>
                  <div className="px-7 pb-8 pt-12">
                    <p className="mb-2 text-[12px] font-extrabold uppercase tracking-wide text-[#B45309]">
                      {lane.badge}
                    </p>
                    <h3 className="text-[22px] font-extrabold">{lane.title}</h3>
                    <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#475569]">{lane.body}</p>
                    <span className="mt-4 inline-block text-[14.5px] font-extrabold text-[#0F172A]">
                      {lane.cta}
                    </span>
                  </div>
                </>
              );

              const shell =
                "block h-full overflow-hidden rounded-3xl bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_18px_40px_rgba(15,23,42,0.14)]";

              return (
                <FadeIn key={lane.title} index={i}>
                  <HoverLift className="h-full">
                    {lane.external ? (
                      <a href={lane.href} className={shell}>
                        {inner}
                      </a>
                    ) : (
                      <Link href={lane.href} className={shell}>
                        {inner}
                      </Link>
                    )}
                  </HoverLift>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* THE SPARK */}
      <section className="relative overflow-hidden bg-[#0F172A] px-5 py-24 text-white lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2">
          <FadeIn from="left">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-[13px] font-bold">
              THE SPARK ✨
            </span>
            <h2 className="text-[32px] font-extrabold leading-tight tracking-tight sm:text-[42px]">
              One 14-year-old with a business idea and{" "}
              <span className="text-[#F5C518]">nowhere to go.</span>
            </h2>
          </FadeIn>

          <FadeIn from="right">
            <p className="text-[16px] leading-[1.7] text-[#CBD5E1]">
              Our founder hit this wall at 14. She had the idea and the drive — but{" "}
              <b className="text-white">no platform existed that was built for her.</b>{" "}
              LinkedIn starts at 16 and is written for people with a career behind
              them. Everything else is either a social feed or a classroom.
            </p>
            <p className="mt-5 text-[16px] leading-[1.7] text-[#CBD5E1]">
              The country isn&apos;t short on young entrepreneurial talent. It&apos;s
              short on the professional scaffolding to hold it up — which is what
              this is.
            </p>
            <div className="mt-6 rounded-[20px] rounded-bl-[4px] bg-[#F5C518] px-7 py-6 text-[16.5px] font-bold leading-snug text-[#0F172A]">
              💛 &ldquo;LinkY101 is where you become someone. LinkedIn is where you
              show everyone you already are.&rdquo;
            </div>
          </FadeIn>
        </div>
      </section>

      {/* SAFETY — the section a parent or safeguarding lead is looking for */}
      <section className="border-y-[2.5px] border-[#0F172A] bg-[#BBF7D0] px-5 py-24 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.15fr]">
          <FadeIn from="left">
            <span className="mb-6 inline-block rounded-[20px] border-[2.5px] border-[#0F172A] bg-white px-5 py-2 text-[12.5px] font-extrabold tracking-wide">
              FOR PARENTS &amp; SAFEGUARDING LEADS
            </span>
            <h2 className="text-[30px] font-extrabold tracking-tight sm:text-[40px]">
              How we keep young people safe
            </h2>
            <p className="mt-5 text-[16px] leading-relaxed text-[#1E293B]">
              These are design decisions, not promises, and they aren&apos;t going to
              change as we grow.
            </p>
            <p className="mt-4 text-[14.5px] leading-relaxed text-[#334155]">
              LinkY101 is not a support service. If a young person raises something
              that needs real help, we say so plainly and point them to Childline and
              Shout rather than pretending we can handle it.
            </p>
            <Link
              href="/safeguarding"
              className="mt-7 inline-block rounded-full border-[2.5px] border-[#0F172A] bg-[#F5C518] px-7 py-3.5 text-[15px] font-extrabold text-[#0F172A] shadow-[3px_3px_0_#0F172A] transition-transform hover:-translate-y-0.5"
            >
              Read the full safeguarding page →
            </Link>
          </FadeIn>

          <ul className="flex flex-col gap-3.5">
            {SAFETY_POINTS.map((line, i) => (
              <FadeIn key={line} index={i} from="right">
                <li className="flex gap-3.5 rounded-2xl border-[2.5px] border-[#0F172A] bg-white p-5 shadow-[3px_3px_0_#0F172A]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-[11px] font-bold text-[#BBF7D0]">
                    ✓
                  </span>
                  <span className="text-[14.5px] leading-relaxed text-[#1E293B]">{line}</span>
                </li>
              </FadeIn>
            ))}
          </ul>
        </div>
      </section>

      {/* SCHOOLS */}
      <section className="px-5 py-24 lg:px-12">
        <FadeIn>
          <div className={`mx-auto max-w-3xl bg-[#FEF08A] px-9 py-10 text-center ${CARD}`}>
            <p className="text-[30px]">🏫</p>
            <h2 className="mt-3 text-[28px] font-extrabold tracking-tight sm:text-[34px]">
              Run a free pilot at your school
            </h2>
            <p className="mx-auto mt-4 max-w-[560px] text-[15.5px] leading-relaxed text-[#1E293B]">
              Your students get the lessons, the podcast, the ambassadors and the
              mentor Q&amp;A. You get something for enterprise and careers that
              doesn&apos;t need planning, marking or a subscription.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3.5">
              <a
                href={SCHOOL_MAILTO}
                className="inline-block rounded-full border-[2.5px] border-[#0F172A] bg-[#0F172A] px-7 py-3.5 text-[15px] font-extrabold text-[#F5C518] transition-transform hover:-translate-y-0.5"
              >
                Email us →
              </a>
              <Link
                href="/schools"
                className="inline-block rounded-full border-[2.5px] border-[#0F172A] bg-white px-7 py-3.5 text-[15px] font-extrabold text-[#0F172A] transition-transform hover:-translate-y-0.5"
              >
                What a pilot involves
              </Link>
            </div>
            <p className="mt-5 text-sm font-bold text-[#92400E]">linky101team@gmail.com</p>
          </div>
        </FadeIn>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[radial-gradient(circle_at_0%_0%,#F3D9E8_0%,#DBEAFE_40%,#D3F5DF_100%)] px-5 py-24 text-center lg:px-12">
        <FadeIn>
          <h2 className="text-[32px] font-extrabold leading-tight tracking-tight sm:text-[46px]">
            Ready to{" "}
            <mark className="bg-[#F5C518] px-2 text-[#0F172A]">become someone?</mark>{" "}
            🚀
          </h2>
          <p className="mt-5 text-[16px] text-[#475569]">
            Free for 13&ndash;19 year olds across the UK. Joining takes about a minute.
          </p>
          <Link href="/signup" className={`${BTN_DARK} mt-8`}>
            Join LinkY101 →
          </Link>
        </FadeIn>
      </section>

      <MarketingFooter />
    </main>
  );
}
