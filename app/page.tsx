import Link from "next/link";
import type { Metadata } from "next";
import { AMBASSADORS, ambassadorAvatar } from "@/lib/ambassadors";
import { FadeIn, FloatIn, HoverLift } from "@/components/landing/Animate";

/**
 * The front door.
 *
 * Everything used to sit behind the sign-up wall, which meant a teacher, a
 * parent or an ambassador you'd asked for their time hit a login box and had
 * no way of finding out what LinkY101 even was. This page does two jobs at
 * once: convince a fifteen-year-old this is for them, and convince the adult
 * standing behind them that it's safe. The second job is the one most teen
 * platforms skip, and it's the one a school checks first.
 *
 * Built the way product sites are built rather than like a poster: white
 * ground, a preview of the actual app beside the headline, and colour used as
 * accent. A full-bleed gradient reads as a flyer — showing the thing working
 * is what makes someone believe it exists.
 *
 * Signed-in visitors never see it — middleware sends them straight to /home.
 */

export const metadata: Metadata = {
  title: "LinkY101 — the UK network for young founders, 13–19",
  description:
    "Learn how business actually works, hear real founder stories, and ask DBS-checked mentors the things you're stuck on. Free for 13–19 year olds across the UK.",
};

const FEATURES = [
  {
    emoji: "📚",
    tint: "bg-[#FCE7F3]",
    title: "Lessons that don't waste your time",
    body: "Finding an idea, first customer, pricing, money. Short, card-by-card, written for someone who's fifteen.",
  },
  {
    emoji: "🛡️",
    tint: "bg-[#D1FAE5]",
    title: "Ask people who've actually done it",
    body: "One question goes to five DBS-checked adults — a principal, a careers lead, business owners. They answer properly.",
  },
  {
    emoji: "🎙️",
    tint: "bg-[#CFFAFE]",
    title: "Founder stories, not highlight reels",
    body: "The first £100, the thing that flopped, what they'd do differently. Listen on the way to school.",
  },
  {
    emoji: "💡",
    tint: "bg-[#FEF3C7]",
    title: "Somewhere to put the idea",
    body: "Post it on the Dream Wall, get it validated, and see what other people your age are building.",
  },
];

const SAFETY = [
  "No direct messages. Nowhere on LinkY101 can an adult message a young person privately.",
  "Every mentor answer is read by a named adult before anyone sees it.",
  "Mentors are DBS-checked. Ambassadors share their story publicly and never contact members.",
  "13–19 only, and nothing is visible to the public internet — it all sits behind a login.",
  "Questions are private by default. Anything shared publicly has the asker's name removed.",
];

/**
 * A small, honest mock of the real Ask screen. Not a screenshot — a screenshot
 * would need a logged-in session to produce and would go stale — but it uses
 * the product's own colours and components so what you see here is what you
 * get when you sign up.
 */
function AppPreview() {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-3 shadow-2xl">
      <div className="rounded-2xl bg-[#F5F3FF] p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-extrabold tracking-tight text-[#111111]">
            LinkY<span className="text-[#F5B301]">101</span>
          </span>
          <span className="flex items-center gap-1 rounded-full bg-[#FFF7ED] px-2.5 py-1 text-[11px] font-extrabold text-[#C2410C]">
            🔥 12
          </span>
        </div>

        <div className="grad-brand flex items-center gap-3 rounded-2xl p-4">
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-extrabold text-white">
              Ask all our mentors
            </span>
            <span className="block text-[11px] text-white/80">2 left this week</span>
          </span>
          <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-extrabold text-[#7C3AED]">
            + Ask
          </span>
        </div>

        <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="flex items-center gap-2.5 border-b border-gray-100 p-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#D1FAE5] text-xs font-bold text-[#047857]">
              ✓
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold text-[#1E1B4B]">
                How do I get my first customer?
              </span>
              <span className="block text-[10px] font-semibold text-gray-400">
                Mark Webb replied
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2.5 p-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FEF3C7] text-xs">
              ⏳
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold text-[#1E1B4B]">
                Can I run a business at 15?
              </span>
              <span className="block text-[10px] font-semibold text-gray-400">
                Waiting for a mentor
              </span>
            </span>
          </div>
        </div>

        <div className="mt-3 rounded-2xl bg-[#ECFDF5] p-3">
          <p className="text-[11px] font-extrabold text-[#047857]">Mark Webb answered</p>
          <p className="mt-1 text-[11px] leading-relaxed text-gray-600">
            Ask ten people you already know. One of them says yes, and that&apos;s
            your first customer — it really is that unglamorous.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  // Real faces, not stock photography. Proof beats promises on a page like this.
  const faces = AMBASSADORS.slice(0, 7);

  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <span className="text-xl font-extrabold tracking-tight text-[#111111]">
            LinkY<span className="text-[#F5B301]">101</span>
          </span>

          <nav className="hidden items-center gap-7 md:flex">
            <Link href="#features" className="text-sm font-bold text-gray-600 hover:text-[#7C3AED]">
              What it is
            </Link>
            <Link href="#safety" className="text-sm font-bold text-gray-600 hover:text-[#7C3AED]">
              For parents
            </Link>
            <Link href="#schools" className="text-sm font-bold text-gray-600 hover:text-[#7C3AED]">
              For schools
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-bold text-[#1E1B4B] hover:bg-gray-50"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="grad-brand rounded-full px-5 py-2.5 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5"
            >
              Join free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — text left, product right. The standard for a reason: it shows
          what you're signing up to instead of describing it. */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-14 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <FadeIn>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E9E5F5] bg-[#F5F3FF] px-3.5 py-1.5 text-xs font-extrabold text-[#7C3AED]">
                🇬🇧 Free for 13–19 year olds in the UK
              </span>
            </FadeIn>

            <FadeIn index={1}>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-[#1E1B4B] sm:text-5xl lg:text-[3.4rem]">
              You don&apos;t need permission.
              <br />
              You need a <span className="text-grad">first customer</span>.
            </h1>
            </FadeIn>

            <FadeIn index={2}>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-gray-600">
                LinkY101 is where young people who want to build something learn how
                business actually works — and ask the people who&apos;ve already done it.
              </p>
            </FadeIn>

            <FadeIn index={3}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="grad-brand rounded-full px-7 py-3.5 text-base font-extrabold text-white shadow-lg shadow-purple-200 transition-transform hover:-translate-y-0.5"
              >
                Join free →
              </Link>
              <Link
                href="#safety"
                className="rounded-full border-2 border-gray-200 px-7 py-3.5 text-base font-extrabold text-[#1E1B4B] transition-colors hover:border-[#1E1B4B]"
              >
                For parents &amp; schools
              </Link>
            </div>
            </FadeIn>

            <FadeIn index={4}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <div className="flex -space-x-2.5">
                {faces.map((a) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={a.id}
                    src={ambassadorAvatar(a.id)}
                    alt={a.name}
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
                  />
                ))}
              </div>
              <p className="text-sm font-semibold text-gray-500">
                <span className="text-[#1E1B4B]">{AMBASSADORS.length} founding ambassadors</span>{" "}
                and 5 DBS-checked mentors already on board
              </p>
            </div>
            </FadeIn>
          </div>

          <FloatIn className="lg:pl-6">
            <AppPreview />
          </FloatIn>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 border-t border-gray-100 bg-[#FAFAFF] py-20">
        <div className="mx-auto max-w-6xl px-5">
          <FadeIn>
            <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-[#1E1B4B] sm:text-4xl">
              Everything you need to start something, in one place
            </h2>
            <p className="mt-3 max-w-xl text-gray-600">
              No jargon, no forty-minute videos, nothing aimed at people twice your age.
            </p>
          </FadeIn>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} index={i}>
              <HoverLift className="h-full rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-2xl ${f.tint}`}>
                  {f.emoji}
                </span>
                <p className="mt-4 text-lg font-extrabold text-[#1E1B4B]">{f.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{f.body}</p>
              </HoverLift>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Which one are you */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <FadeIn>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1E1B4B] sm:text-4xl">
              Which one are you?
            </h2>
          </FadeIn>

          <div className="mt-9 grid gap-5 md:grid-cols-3">
            <FadeIn index={0}>
            <HoverLift>
            <Link
              href="/signup"
              className="block overflow-hidden rounded-2xl border border-gray-200 transition-shadow hover:shadow-lg"
            >
              <div className="grad-brand h-1.5" />
              <div className="p-6">
                <p className="text-xl font-extrabold text-[#1E1B4B]">I&apos;m 13–19</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  You&apos;ve got an idea, or you just want to know how people start.
                  Everything unlocks on day one.
                </p>
                <span className="mt-4 inline-block text-sm font-extrabold text-[#7C3AED]">
                  Create an account →
                </span>
              </div>
            </Link>
            </HoverLift>
            </FadeIn>

            <FadeIn index={1}>
            <HoverLift>
            <Link
              href="#safety"
              className="block overflow-hidden rounded-2xl border border-gray-200 transition-shadow hover:shadow-lg"
            >
              <div className="h-1.5 bg-[#10B981]" />
              <div className="p-6">
                <p className="text-xl font-extrabold text-[#1E1B4B]">I&apos;m a parent</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  You want to know who your child is talking to and what happens to
                  what they write. Straight answers, no waffle.
                </p>
                <span className="mt-4 inline-block text-sm font-extrabold text-[#047857]">
                  How we keep it safe →
                </span>
              </div>
            </Link>
            </HoverLift>
            </FadeIn>

            <FadeIn index={2}>
            <HoverLift>
            <Link
              href="#schools"
              className="block overflow-hidden rounded-2xl border border-gray-200 transition-shadow hover:shadow-lg"
            >
              <div className="h-1.5 bg-[#F59E0B]" />
              <div className="p-6">
                <p className="text-xl font-extrabold text-[#1E1B4B]">I&apos;m a school</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Enterprise and careers provision students will actually open. Free
                  pilots running this term.
                </p>
                <span className="mt-4 inline-block text-sm font-extrabold text-[#B45309]">
                  Talk to us →
                </span>
              </div>
            </Link>
            </HoverLift>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Safety — the section a parent or safeguarding lead is looking for */}
      <section id="safety" className="scroll-mt-20 border-y border-gray-100 bg-[#F6FEFA] py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[1fr_1.2fr]">
          <FadeIn from="left">
            <span className="inline-block rounded-full bg-[#D1FAE5] px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-[#047857]">
              For parents &amp; safeguarding leads
            </span>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#1E1B4B] sm:text-4xl">
              How we keep young people safe
            </h2>
            <p className="mt-4 leading-relaxed text-gray-600">
              These are design decisions, not promises, and they aren&apos;t going to
              change as we grow.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-gray-500">
              LinkY101 is not a support service. If a young person raises something
              that needs real help, we say so plainly and point them to Childline and
              Shout rather than pretending we can handle it.
            </p>
          </FadeIn>

          <ul className="flex flex-col gap-3">
            {SAFETY.map((line, i) => (
              <FadeIn key={line} index={i} from="right">
              <li className="flex gap-3.5 rounded-2xl border border-gray-200 bg-white p-4">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-[11px] font-bold text-white">
                  ✓
                </span>
                <span className="text-sm leading-relaxed text-gray-700">{line}</span>
              </li>
              </FadeIn>
            ))}
          </ul>
        </div>
      </section>

      {/* Schools */}
      <section id="schools" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-4xl px-5">
          <FadeIn>
          <div className="rounded-3xl border border-[#F59E0B]/30 bg-[#FFFBEB] p-9 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1E1B4B]">
              Run a free pilot at your school
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-gray-600">
              Your students get the lessons, the podcast, the ambassadors and the
              mentor Q&amp;A. You get something for enterprise and careers that
              doesn&apos;t need planning, marking or a subscription.
            </p>
            <Link
              href="/signup"
              className="mt-7 inline-block rounded-full bg-[#1E1B4B] px-8 py-3.5 text-base font-extrabold text-white transition-transform hover:-translate-y-0.5"
            >
              Get in touch →
            </Link>
          </div>
          </FadeIn>
        </div>
      </section>

      {/* One coloured band, at the end, where it earns its place */}
      <section className="grad-hero py-16">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <FadeIn>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Start before you&apos;re ready.
          </h2>
          <p className="mx-auto mt-3 max-w-md leading-relaxed text-white/90">
            Ready is something you become. Joining takes about a minute.
          </p>
          <Link
            href="/signup"
            className="mt-7 inline-block rounded-full bg-white px-9 py-3.5 text-base font-extrabold text-[#7C3AED] shadow-lg transition-transform hover:-translate-y-0.5"
          >
            Join LinkY101
          </Link>
          </FadeIn>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-5 text-center">
          <span className="text-lg font-extrabold tracking-tight text-[#111111]">
            LinkY<span className="text-[#F5B301]">101</span>
          </span>
          <p className="text-xs text-gray-500">
            The UK network for young entrepreneurs aged 13–19.
          </p>
          <div className="mt-2 flex gap-5 text-xs font-bold text-gray-500">
            <Link href="/login" className="hover:text-[#7C3AED]">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-[#7C3AED]">
              Join free
            </Link>
            <Link href="#safety" className="hover:text-[#7C3AED]">
              Safety
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
