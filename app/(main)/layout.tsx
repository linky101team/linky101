"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, BookOpen, Users, Compass, User, Crown } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { createClientSupabase } from "@/lib/supabase/client";
import InstallPrompt from "@/components/InstallPrompt";
import NotificationPermissionModal from "@/components/NotificationPermissionModal";
import LinkyChat from "@/components/LinkyChat";
import Sidebar from "@/components/layout/Sidebar";
import RightRail from "@/components/layout/RightRail";

const TABS = [
  { href: "/home", icon: Home, color: "#FFC107", label: "Home" },
  { href: "/learn", icon: BookOpen, color: "#4ECDC4", label: "Learn" },
  { href: "/community", icon: Users, color: "#FF6B6B", label: "Feed" },
  { href: "/discover", icon: Compass, color: "#039BE5", label: "Discover" },
  { href: "/profile", icon: User, color: "#A78BFA", label: "Profile" },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useProfile();
  const pathname = usePathname();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("is_read", false)
      .then(({ count }) => setHasUnread((count ?? 0) > 0));
  }, [profile, supabase]);

  if (loading && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-semibold text-text-muted">Loading...</p>
      </div>
    );
  }

  const initial = profile?.first_name?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="min-h-screen bg-bg lg:flex">
      {profile && <NotificationPermissionModal pushEnabled={!!profile.notification_settings?.push_enabled} />}

      {/* Real desktop nav — a persistent sidebar, not a shrunk phone screen */}
      <Sidebar profile={profile} hasUnread={hasUnread} />

      {/*
        The sidebar is `fixed`, which takes it out of normal document flow —
        without this left offset, this content column would render
        underneath it instead of next to it.
      */}
      <div className="flex min-h-screen flex-1 flex-col pb-20 lg:pb-0 lg:pl-64">
        {/* Mobile-only top bar. On desktop the sidebar already carries the logo, Pro badge, bell and avatar. */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-3 lg:hidden">
          <Link href="/home" className="text-xl font-extrabold tracking-tight text-[#1A1A2E]">
            Link<span className="text-[#1A1A2E]">Y</span>
            <span className="text-[#F5B301]">101</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/premium"
              aria-label="Go Premium"
              className="flex items-center gap-1 rounded-full bg-[#FFF7DB] px-2.5 py-1 text-xs font-bold text-[#B8860B] transition-transform active:scale-95"
            >
              <Crown className="h-3.5 w-3.5" strokeWidth={2.5} />
              Pro
            </Link>

            <Link href="/notifications" aria-label="Notifications" className="relative p-1 text-ink">
              <Bell className="h-5 w-5" strokeWidth={2} />
              {hasUnread && (
                <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-[#FF6B6B]" />
              )}
            </Link>

            <Link href="/profile" aria-label="Profile">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.first_name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A1A2E] text-sm font-bold text-white">
                  {initial}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Real desktop dashboard: content column + persistent right rail, not a phone screen floating in empty space */}
        <div className="flex-1 lg:mx-auto lg:flex lg:w-full lg:max-w-[1440px] lg:gap-10 lg:px-10 lg:py-8">
          <main className="flex-1 px-5 py-4 lg:min-w-0 lg:max-w-3xl lg:px-0 lg:py-0">{children}</main>
          <RightRail profile={profile} />
        </div>

        {/* Mobile-only bottom tab bar — desktop uses the sidebar instead */}
        <nav className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
          <div className="mx-auto flex max-w-[430px] border-t border-gray-200 bg-white">
            {TABS.map((tab) => {
              const active = pathname.startsWith(tab.href);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-label={tab.label}
                  className="flex flex-1 flex-col items-center gap-1.5 pb-2.5 pt-3 transition-transform active:scale-90"
                >
                  <Icon
                    className="h-5 w-5 transition-colors"
                    style={{ color: active ? "#1A1A2E" : "#9CA3AF" }}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span
                    className="h-[3px] w-6 rounded-full transition-all"
                    style={{ backgroundColor: active ? tab.color : "transparent" }}
                  />
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <InstallPrompt />
      <LinkyChat />
    </div>
  );
}
