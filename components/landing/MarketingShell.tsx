"use client";

import Link from "next/link";
import { useState } from "react";
import { BTN_YELLOW, AMBASSADOR_MAILTO } from "./marketingStyles";

/**
 * The public shell — the nav and footer every signed-out page shares.
 *
 * This is the LinkY101 waitlist look brought into the real app: soft blue
 * ground, navy 2.5px outlines, and hard offset shadows instead of soft ones.
 * The whole style lives in these two components plus the shared card classes
 * below, so changing the look everywhere is one file rather than six.
 *
 * It's a client component only because of the burger menu. Nothing else here
 * needs JavaScript, and the pages that use it stay server-rendered.
 */

/**
 * There are two kinds of person on LinkY101: founders (13–19) and mentors
 * (checked adults). There is no separate "rising founder" tier — one network,
 * one member type, and homeschooled or self-taught builders signing up on
 * their own sit inside the founder bracket like everyone else.
 */
const NAV_LINKS = [
  { href: "/founders", label: "For Founders" },
  { href: "/become-an-ambassador", label: "Ambassadors" },
  { href: "/schools", label: "For Schools" },
  { href: "/safeguarding", label: "Safety" },
  { href: "/about", label: "About" },
];

/**
 * The wordmark: "LinkY" in black, "101" in gold. Those two colours are fixed
 * across the whole product — the waitlist design used a near-identical pair,
 * so this matches the mock and stays consistent with every other screen.
 */
function Wordmark({ size = "large" }: { size?: "large" | "small" }) {
  const dot = size === "large" ? "h-[38px] w-[38px] text-[17px]" : "h-[34px] w-[34px] text-[15px]";
  const text = size === "large" ? "text-xl" : "text-lg";
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={`flex items-center justify-center rounded-full bg-[#111111] font-extrabold text-[#F5B301] ${dot}`}
      >
        L
      </span>
      <span className={`font-extrabold text-[#111111] ${text}`}>
        LinkY<span className="text-[#F5B301]">101</span>
      </span>
    </span>
  );
}

export function MarketingNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b-[2.5px] border-[#0F172A] bg-[#DBEAFE]">
      <div className="flex items-center justify-between px-5 py-4 lg:px-12">
        <Link href="/" onClick={() => setOpen(false)}>
          <Wordmark />
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[15px] font-semibold text-[#334155] hover:text-[#0F172A]"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-5 lg:flex">
          <Link href="/login" className="text-[15px] font-semibold text-[#0F172A]">
            Sign in
          </Link>
          <Link href="/signup" className={BTN_YELLOW}>
            Join LinkY101
          </Link>
        </div>

        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="text-[26px] leading-none text-[#0F172A] lg:hidden"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div className="border-t-[2.5px] border-[#0F172A] bg-[#DBEAFE] px-5 pb-5 pt-2 lg:hidden">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block border-b border-[#BFDBFE] py-3 text-[15px] font-semibold text-[#334155]"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-4 flex items-center gap-4">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="text-[15px] font-semibold text-[#0F172A]"
            >
              Sign in
            </Link>
            <Link href="/signup" onClick={() => setOpen(false)} className={BTN_YELLOW}>
              Join LinkY101
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-[#0F172A]/15 bg-[#DBEAFE] px-5 pt-14 lg:px-12">
      <div className="mx-auto grid max-w-6xl gap-8 pb-10 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <div className="mb-3.5">
            <Wordmark size="small" />
          </div>
          <p className="max-w-[340px] text-[13.5px] leading-relaxed text-[#475569]">
            The UK network built for young people aged 13&ndash;19. Started by a
            teenager who went looking for one and found nothing.
          </p>
        </div>

        <div>
          <p className="mb-3.5 text-[11.5px] font-extrabold uppercase tracking-wide text-[#0F172A]">
            Platform
          </p>
          {[
            { href: "/founders", label: "For Founders" },
            { href: "/become-an-ambassador", label: "Ambassadors" },
            { href: "/schools", label: "For Schools" },
            { href: "/about", label: "About" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="mb-2.5 block text-sm font-semibold text-[#475569] hover:text-[#0F172A]"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div>
          <p className="mb-3.5 text-[11.5px] font-extrabold uppercase tracking-wide text-[#0F172A]">
            Trust
          </p>
          <Link
            href="/safeguarding"
            className="mb-2.5 block text-sm font-semibold text-[#475569] hover:text-[#0F172A]"
          >
            Safeguarding
          </Link>
          <a
            href={AMBASSADOR_MAILTO}
            className="mb-2.5 block text-sm font-semibold text-[#475569] hover:text-[#0F172A]"
          >
            Become an ambassador
          </a>
          <a
            href="mailto:linky101team@gmail.com"
            className="mb-2.5 block text-sm font-semibold text-[#475569] hover:text-[#0F172A]"
          >
            linky101team@gmail.com
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-6xl border-t border-[#BFDBFE]">
        <div className="flex flex-wrap justify-between gap-2 py-5 text-[12.5px] text-[#64748B]">
          <span>© 2026 LinkY101. Built in the United Kingdom.</span>
          <span>For ages 13&ndash;19, with safeguarding at the core.</span>
        </div>
      </div>
    </footer>
  );
}
