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
