/**
 * Shared chrome for the public pages.
 *
 * These live in their own plain module rather than inside MarketingShell.tsx
 * on purpose. MarketingShell is a `"use client"` module, and anything a
 * server component imports from a client module arrives as a client
 * *reference*, not the value — interpolating one into a template literal
 * (`${BTN_DARK} mt-8`) silently produces the string "[object Object]" and the
 * button renders as bare text. Keeping the strings here means every page can
 * compose them freely.
 */

/** Card chrome used across every public page: navy outline + hard shadow. */
export const CARD =
  "rounded-3xl border-[2.5px] border-[#0F172A] shadow-[4px_4px_0_#0F172A]";

/** The yellow pill button — the one that always means "join". */
export const BTN_YELLOW =
  "inline-block rounded-full border-[2.5px] border-[#0F172A] bg-[#F5C518] px-5 py-2.5 text-[15px] font-extrabold text-[#0F172A] shadow-[3px_3px_0_#0F172A] transition-transform hover:-translate-y-0.5";

export const BTN_DARK =
  "inline-block rounded-full border-[2.5px] border-[#0F172A] bg-[#0F172A] px-6 py-4 text-[15.5px] font-extrabold text-[#F5C518] transition-transform hover:-translate-y-0.5";

export const BTN_OUTLINE =
  "inline-block rounded-full border-[2.5px] border-[#0F172A] bg-white px-6 py-4 text-[15.5px] font-extrabold text-[#0F172A] transition-transform hover:-translate-y-0.5";

/**
 * Where a would-be mentor or a school goes.
 *
 * Neither of them is going to create a member account to get in touch — they
 * email. The subject line is pre-filled so the two kinds of enquiry are easy
 * to tell apart in the inbox at a glance.
 */
export const MENTOR_MAILTO =
  "mailto:linky101team@gmail.com?subject=Becoming%20a%20LinkY101%20mentor&body=Hi%20LinkY101%2C%0A%0AI%27d%20like%20to%20find%20out%20about%20mentoring%20on%20LinkY101.%0A%0AName%3A%0AWhat%20I%20do%3A%0ALinkedIn%3A%0A";

export const SCHOOL_MAILTO =
  "mailto:linky101team@gmail.com?subject=LinkY101%20school%20pilot&body=Hi%20LinkY101%2C%0A%0AI%27d%20like%20to%20find%20out%20more%20about%20running%20a%20pilot%20at%20our%20school.%0A%0ASchool%3A%0AMy%20role%3A%0A";

/**
 * The four things a member actually gets on the day they join.
 *
 * Kept here rather than in the landing page so the founders page and the
 * landing page can never drift apart and start promising different products.
 * Every line describes something that exists today — nothing aspirational.
 */
export const WHATS_INSIDE = [
  {
    emoji: "📚",
    tone: "bg-[#FECDD3]",
    title: "Lessons that don't waste your time",
    body: "Finding an idea, first customers, pricing, money. Short, card-by-card, written for someone who's fifteen — not an MBA.",
  },
  {
    emoji: "🤝",
    tone: "bg-[#BBF7D0]",
    title: "Ask people who've actually done it",
    body: "One question goes to the whole mentor panel — business owners, a principal, a careers lead. They answer properly, in writing.",
  },
  {
    emoji: "🎙️",
    tone: "bg-[#A5F3FC]",
    title: "Founder stories, not highlight reels",
    body: "The first £100, the thing that flopped, what they'd do differently. Listen on the way to school.",
  },
  {
    emoji: "💡",
    tone: "bg-[#FEF08A]",
    title: "Somewhere to put the idea",
    body: "Post it on the Dream Wall, get it validated, and see what other people your age are building.",
  },
] as const;

/**
 * The safeguarding lines a parent or a DSL is scanning for. Same list as the
 * safeguarding page, kept short enough to read in one go on the landing page.
 */
export const SAFETY_POINTS = [
  "No direct messages. Nowhere on LinkY101 can an adult message a young person privately.",
  "Every mentor answer is read by a named adult before anyone sees it.",
  "Mentors are checked before they can answer anything. Ambassadors share their story publicly and never contact members.",
  "13–19 only, and nothing is visible to the public internet — it all sits behind a login.",
  "Questions are private by default. Anything shared publicly has the asker's name removed.",
] as const;
