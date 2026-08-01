"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, BookOpen, Mic, Compass, User, Star, Sparkles, Wrench } from "lucide-react";
import type { Profile } from "@/hooks/useProfile";

const PRIMARY = [
  { href: "/home", icon: Home, color: "#7C3AED", tint: "#F3E8FF", label: "Home" },
  { href: "/learn", icon: BookOpen, color: "#EC4899", tint: "#FCE7F3", label: "Learn" },
  { href: "/podcasts", icon: Mic, color: "#06B6D4", tint: "#CFFAFE", label: "Podcasts" },
  { href: "/discover", icon: Compass, color: "#F59E0B", tint: "#FEF3C7", label: "Discover" },
  { href: "/profile", icon: User, color: "#10B981", tint: "#D1FAE5", label: "Profile" },
];

const SECONDARY = [
  { href: "/mentors", icon: Star, color: "#7C3AED", label: "Ambassadors" },
  { href: "/dreams", icon: Sparkles, color: "#EC4899", label: "Dream Wall" },
  { href: "/tools", icon: Wrench, color: "#06B6D4", label: "Founder Tools" },
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
      <Link href="/home" className="px-6 py-6 text-2xl font-extrabold tracking-tight text-[#1E1B4B]">
        LinkY<span className="text-grad">101</span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3">
        {PRIMARY.map((tab) => {
          const active = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="mb-1 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-colors"
              style={{
                backgroundColor: active ? tab.tint : "transparent",
                color: active ? "#1E1B4B" : "#6B7280",
              }}
            >
              <Icon
                className="h-5 w-5"
                style={{ color: active ? tab.color : "#9CA3AF" }}
                strokeWidth={active ? 2.5 : 2}
              />
              {tab.label}
            </Link>
          );
        })}

        <p className="mb-1 mt-5 px-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Explore
        </p>
        {SECONDARY.map((tab) => {
          const active = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="mb-1 flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors hover:bg-gray-50"
              style={{ color: active ? "#1E1B4B" : "#6B7280" }}
            >
              <Icon
                className="h-4.5 w-4.5"
                style={{ color: active ? tab.color : "#9CA3AF" }}
                strokeWidth={2}
              />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-2 border-t border-gray-100 p-4">
        <Link
          href="/notifications"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50"
        >
          <span className="relative">
            <Bell className="h-5 w-5" strokeWidth={2} />
            {hasUnread && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#EC4899]" />}
          </span>
          Notifications
        </Link>

        <Link href="/profile" className="mt-1 flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-gray-50">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt={profile.first_name} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="grad-brand flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white">
              {initial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-gray-900">{profile?.first_name ?? "You"}</p>
            <p className="text-xs text-gray-400">View profile</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
