"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, BookOpen, Mic, Compass, User, Star, ShieldCheck, MessageCircleQuestion, Sparkles, Wrench, Trophy, Crown } from "lucide-react";
import type { Profile } from "@/hooks/useProfile";

const PRIMARY = [
  { href: "/home", icon: Home, color: "#7C3AED", tint: "#F3E8FF", label: "Home" },
  { href: "/learn", icon: BookOpen, color: "#EC4899", tint: "#FCE7F3", label: "Learn" },
  { href: "/podcasts", icon: Mic, color: "#06B6D4", tint: "#CFFAFE", label: "Podcasts" },
  { href: "/discover", icon: Compass, color: "#F59E0B", tint: "#FEF3C7", label: "Discover" },
  { href: "/profile", icon: User, color: "#10B981", tint: "#D1FAE5", label: "Profile" },
];

const SECONDARY = [
  // Two separate entries on purpose. Ambassadors are founders telling their
  // story; mentors are DBS-checked adults you can ask a question. Collapsing
  // them into one link hid that difference from members and from parents.
  { href: "/ambassadors", icon: Star, color: "#F59E0B", tint: "#FEF3C7", label: "Ambassadors" },
  { href: "/mentors", icon: ShieldCheck, color: "#10B981", tint: "#D1FAE5", label: "Mentors" },
  { href: "/ask", icon: MessageCircleQuestion, color: "#7C3AED", tint: "#F3E8FF", label: "Ask" },
  { href: "/dreams", icon: Sparkles, color: "#EC4899", tint: "#FCE7F3", label: "Dream Wall" },
  { href: "/tools", icon: Wrench, color: "#06B6D4", tint: "#CFFAFE", label: "Founder Tools" },
];

interface SidebarProps {
  profile: Profile | null;
  hasUnread: boolean;
}

/** Desktop-only navigation rail — hidden below `lg`, where bottom tabs take over. */
export default function Sidebar({ profile, hasUnread }: SidebarProps) {
  const pathname = usePathname();
  const initial = profile?.first_name?.charAt(0).toUpperCase() ?? "?";

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-gray-200 bg-white lg:flex">
      {/* Brand: LinkY in black, 101 in gold. Not a gradient, not red — this is fixed. */}
      <Link href="/home" className="px-6 py-6 text-2xl font-extrabold tracking-tight text-[#111111]">
        LinkY<span className="text-[#F5B301]">101</span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3">
        {PRIMARY.map((tab) => {
          const active = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="mb-1.5 flex items-center gap-3 rounded-2xl px-2.5 py-2 text-sm font-bold transition-all hover:bg-gray-50"
              style={{
                backgroundColor: active ? tab.tint : "transparent",
                color: active ? "#1E1B4B" : "#4B5563",
              }}
            >
              {/* Icons stay in colour whether or not the tab is active — the rail
                  should look alive, not like a list of grey text. */}
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: active ? "#FFFFFF" : tab.tint }}
              >
                <Icon className="h-[18px] w-[18px]" style={{ color: tab.color }} strokeWidth={2.5} />
              </span>
              {tab.label}
            </Link>
          );
        })}

        <p className="mb-2 mt-6 px-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
          Explore
        </p>
        {SECONDARY.map((tab) => {
          const active = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="mb-1.5 flex items-center gap-3 rounded-2xl px-2.5 py-2 text-sm font-bold transition-all hover:bg-gray-50"
              style={{
                backgroundColor: active ? tab.tint : "transparent",
                color: active ? "#1E1B4B" : "#4B5563",
              }}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: active ? "#FFFFFF" : tab.tint }}
              >
                <Icon className="h-[18px] w-[18px]" style={{ color: tab.color }} strokeWidth={2.5} />
              </span>
              {tab.label}
            </Link>
          );
        })}

        {/* Primary call to action — also stops the rail trailing off into dead space */}
        <Link
          href="/dreams"
          className="grad-brand mt-5 flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5"
        >
          <Sparkles className="h-4 w-4" strokeWidth={2.5} />
          Post your idea
        </Link>

        <Link
          href="/dreams"
          className="grad-gold mt-3 block rounded-2xl border border-[#F59E0B]/40 p-3.5"
        >
          <p className="flex items-center gap-1.5 text-xs font-extrabold text-[#92400E]">
            <Trophy className="h-3.5 w-3.5" strokeWidth={2.5} />
            Top 50 win an event
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-[#92400E]/80">
            Most-loved ideas each month get a Zoom with an ambassador.
          </p>
        </Link>

        {!profile?.is_premium && (
          <Link
            href="/premium"
            className="mt-3 flex items-center gap-2 rounded-2xl bg-[#F5F3FF] p-3.5 transition-colors hover:bg-[#EDE9FE]"
          >
            <Crown className="h-4 w-4 shrink-0 text-[#7C3AED]" strokeWidth={2.5} />
            <span className="text-xs font-extrabold text-[#5B21B6]">Go Pro</span>
          </Link>
        )}
      </nav>

      <div className="flex flex-col gap-1 border-t border-gray-100 p-3">
        <Link
          href="/notifications"
          className="flex items-center gap-3 rounded-2xl px-2.5 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50"
        >
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100">
            <Bell className="h-[18px] w-[18px] text-gray-500" strokeWidth={2.5} />
            {hasUnread && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#EC4899]" />}
          </span>
          Notifications
        </Link>

        <Link href="/profile" className="flex items-center gap-3 rounded-2xl px-2.5 py-2 hover:bg-gray-50">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt={profile.first_name} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="grad-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
              {initial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[#1E1B4B]">{profile?.first_name ?? "You"}</p>
            <p className="text-xs capitalize text-gray-400">{profile?.role ?? "Founder"}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
