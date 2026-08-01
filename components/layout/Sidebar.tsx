"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, BookOpen, Users, Compass, User, Crown } from "lucide-react";
import type { Profile } from "@/hooks/useProfile";

const TABS = [
  { href: "/home", icon: Home, color: "#FFC107", tint: "#FFF8E1", label: "Home" },
  { href: "/learn", icon: BookOpen, color: "#4ECDC4", tint: "#E6FBF9", label: "Learn" },
  { href: "/community", icon: Users, color: "#FF6B6B", tint: "#FFF0F0", label: "Feed" },
  { href: "/discover", icon: Compass, color: "#039BE5", tint: "#E3F2FD", label: "Discover" },
  { href: "/mentors", icon: Users, color: "#A78BFA", tint: "#F3E8FF", label: "Ambassadors" },
  { href: "/profile", icon: User, color: "#A78BFA", tint: "#F3E8FF", label: "Profile" },
];

interface SidebarProps {
  profile: Profile | null;
  hasUnread: boolean;
}

/** Desktop-only left navigation rail — hidden below the `lg` breakpoint, where the bottom tab bar takes over. */
export default function Sidebar({ profile, hasUnread }: SidebarProps) {
  const pathname = usePathname();
  const initial = profile?.first_name?.charAt(0).toUpperCase() ?? "?";

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-gray-200 bg-white lg:flex">
      <Link href="/home" className="flex items-center px-6 py-6 text-xl font-extrabold tracking-tight text-[#1A1A2E]">
        Link<span className="text-[#1A1A2E]">Y</span>
        <span className="text-[#F5B301]">101</span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3">
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="mb-1 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-colors"
              style={{
                backgroundColor: active ? tab.tint : "transparent",
                color: active ? "#1A1A2E" : "#6B7280",
              }}
            >
              <Icon className="h-5 w-5" style={{ color: active ? tab.color : "#9CA3AF" }} strokeWidth={active ? 2.5 : 2} />
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
            {hasUnread && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#FF6B6B]" />}
          </span>
          Notifications
        </Link>

        <Link
          href="/premium"
          className="flex items-center gap-2 rounded-xl bg-[#FFF7DB] px-3.5 py-2.5 text-sm font-bold text-[#B8860B] transition-transform active:scale-[0.98]"
        >
          <Crown className="h-4 w-4" strokeWidth={2.5} />
          Go Pro
        </Link>

        <Link href="/profile" className="mt-1 flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-gray-50">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt={profile.first_name} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A1A2E] text-sm font-bold text-white">
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
