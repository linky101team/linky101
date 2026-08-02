import Link from "next/link";
import type { Metadata } from "next";
import { AMBASSADORS, ambassadorAvatar } from "@/lib/ambassadors";

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
 * Signed-in visitors never see it — middleware sends them straight to /home.
 */

export const metadata: Metadata = {
  title: "LinkY101 — the UK network for young founders, 13–19",
  description:
    "Learn how business actually works, hear real founder stories, and ask DBS-checked mentors the things you're stuck on. Free for 13–19 year olds across the UK.",
};

const WHAT_YOU_GET = [
  {
    emoji: "📚",
    title: "Learn how it actually works",
    body: "Short lessons on finding an idea, getting your first customer, pricing, and money. Written for someone who's fifteen, not someone doing an MBA.",
    tint: "bg-[#FCE7F3]",
  },
  {
    emoji: "🛡️",
    title: "Ask people who've done it",
    body: "Put a question to five DBS-checked adults — a principal, a careers lead, business owners. They answer properly, and the best answers go up for everyone.",
    tint: "bg-[#D1FAE5]",
  },
  {
    emoji: "🎙️",
    title: "Hear the real stories",
    body: "Founders talking about the bit nobody posts: the first £100, the thing that didn't work, what they'd do differently. Listen on the way to school.",
    tint: "bg-[#CFFAFE]",
  },
];

const SAFETY = [
  "No direct messages. Nowhere on LinkY101 can an adult message a young person privately.",
  "Every mentor answer is read by a named adult before anyone sees it.",
  "Mentors are DBS-checked. Ambassadors share their story publicly and never contact members.",
  "13–19 only, and nothing is visible to the public internet — it all sits behind a login.",
  "Questions are private by default. Anything shared publicly has the asker's name removed.",
];

export default function LandingPage() {
  // Real faces, not stock photography. Proof beats promises on a page like this.
  const faces = AMBASSADORS.slice(0, 8);

  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <span className="text-xl font-extrabold tracking-tight text-[#111111]">
            LinkY<span className="text-[#F5B301]">101</span>
          </span>
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

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-14 pt-14 sm:pt-20">
        <p className="text-xs font-extrabold uppercase tracking-widest text-[#7C3AED]">
          For 13–19 year olds across the UK
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-[#1E1B4B] sm:text-6xl">
          You don&apos;t need permission.
          <br />
          <span className="text-grad">You need a first customer.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-600">
          LinkY101 is where young people who want to build something learn how
          business actually works — and ask the people who&apos;ve already done it.
          Free, and made for your age.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/signup"
            className="grad-brand rounded-full px-7 py-3.5 text-base font-extrabold text-white transition-transform hover:-translate-y-0.5"
          >
            Join free →
          </Link>
          <Link
            href="#safety"
            className="rounded-full border-2 border-[#1E1B4B] px-7 py-3.5 text-base font-extrabold text-[#1E1B4B] transition-colors hover:bg-[#1E1B4B] hover:text-white"
          >
            For parents &amp; schools
          </Link>
        </div>

        {/* Proof strip — real ambassadors, real faces */}
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <div className="flex -space-x-3">
            {faces.map((a) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={a.id}
                src={ambassadorAvatar(a.id)}
                alt={a.name}
                className="h-11 w-11 rounded-full object-cover ring-2 ring-white"
              />
            ))}
          </div>
          <p className="text-sm font-semibold text-gray-500">
            {AMBASSADORS.length} founding ambassadors · 5 DBS-checked mentors
          </p>
        </div>
      </section>

      {/* What you get */}
      <section className="border-y border-gray-100 bg-[#F5F3FF] py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1E1B4B]">
            What you actually get
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {WHAT_YOU_GET.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${item.tint}`}
                >
                  {item.emoji}
                </span>
                <p className="mt-4 text-lg font-extrabold text-[#1E1B4B]">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Choose your path */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1E1B4B]">
            Not sure where you fit?
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <Link
              href="/signup"
              className="group rounded-3xl border-2 border-gray-200 p-6 transition-colors hover:border-[#7C3AED]"
            >
              <p className="text-xl font-extrabold text-[#1E1B4B]">
                I&apos;m <span className="text-[#7C3AED]">13–19</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                You&apos;ve got an idea, or you just want to know how people start.
                Join free and everything unlocks from day one.
              </p>
              <span className="mt-4 inline-block text-sm font-extrabold text-[#7C3AED]">
                Create an account →
              </span>
            </Link>

            <Link
              href="#safety"
              className="group rounded-3xl border-2 border-gray-200 p-6 transition-colors hover:border-[#10B981]"
            >
              <p className="text-xl font-extrabold text-[#1E1B4B]">
                I&apos;m a <span className="text-[#10B981]">parent</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Fair enough — you want to know who your child is talking to and
                what happens to what they write. Straight answers below.
              </p>
              <span className="mt-4 inline-block text-sm font-extrabold text-[#10B981]">
                How we keep it safe →
              </span>
            </Link>

            <Link
              href="#schools"
              className="group rounded-3xl border-2 border-gray-200 p-6 transition-colors hover:border-[#F59E0B]"
            >
              <p className="text-xl font-extrabold text-[#1E1B4B]">
                I&apos;m a <span className="text-[#B45309]">school</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Enterprise and careers provision your students will actually
                open. We&apos;re running free pilots this term.
              </p>
              <span className="mt-4 inline-block text-sm font-extrabold text-[#B45309]">
                Talk to us →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Safety — the section a parent or safeguarding lead is looking for */}
      <section id="safety" className="scroll-mt-20 border-y border-gray-100 bg-[#ECFDF5] py-16">
        <div className="mx-auto max-w-3xl px-5">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#047857]">
            For parents and safeguarding leads
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#065F46]">
            How LinkY101 keeps young people safe
          </h2>
          <p className="mt-4 leading-relaxed text-[#047857]">
            The design decisions below are deliberate, and they aren&apos;t going to
            change as we grow.
          </p>

          <ul className="mt-7 flex flex-col gap-3">
            {SAFETY.map((line) => (
              <li key={line} className="flex gap-3 rounded-2xl bg-white p-4">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-xs font-bold text-white">
                  ✓
                </span>
                <span className="text-sm leading-relaxed text-gray-700">{line}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm leading-relaxed text-[#047857]">
            LinkY101 is not a support service. If a young person raises something
            that needs real help, we say so plainly and point them to Childline and
            Shout rather than pretending we can handle it.
          </p>
        </div>
      </section>

      {/* Schools */}
      <section id="schools" className="scroll-mt-20 py-16">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1E1B4B]">
            Running a pilot at your school
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-gray-600">
            Free this term. Your students get the lessons, the podcast, the
            ambassadors and the mentor Q&amp;A. You get something for enterprise and
            careers that doesn&apos;t need planning, marking or a subscription.
          </p>
          <Link
            href="/signup"
            className="grad-brand mt-7 inline-block rounded-full px-7 py-3.5 text-base font-extrabold text-white transition-transform hover:-translate-y-0.5"
          >
            Get in touch →
          </Link>
        </div>
      </section>

      {/* Final call */}
      <section className="grad-hero py-16">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Start before you&apos;re ready.
          </h2>
          <p className="mx-auto mt-3 max-w-md leading-relaxed text-white/80">
            Ready is something you become. Join free — it takes about a minute.
          </p>
          <Link
            href="/signup"
            className="mt-7 inline-block rounded-full bg-white px-8 py-3.5 text-base font-extrabold text-[#7C3AED] transition-transform hover:-translate-y-0.5"
          >
            Join LinkY101
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-5 text-center">
          <span className="text-lg font-extrabold tracking-tight text-[#111111]">
            LinkY<span className="text-[#F5B301]">101</span>
          </span>
          <p className="text-xs text-gray-500">
            The UK network for young entrepreneurs aged 13–19.
          </p>
          <div className="mt-1 flex gap-4 text-xs font-semibold text-gray-500">
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
