"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Mic, Compass, User } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { createClientSupabase } from "@/lib/supabase/client";
import InstallPrompt from "@/components/InstallPrompt";
import NotificationPermissionModal from "@/components/NotificationPermissionModal";
import LinkyChat from "@/components/LinkyChat";
import Sidebar from "@/components/layout/Sidebar";
import RightRail from "@/components/layout/RightRail";
import TopBar from "@/components/layout/TopBar";

export const NAV_TABS = [
  { href: "/home", icon: Home, color: "#7C3AED", tint: "#F3E8FF", label: "Home" },
  { href: "/learn", icon: BookOpen, color: "#EC4899", tint: "#FCE7F3", label: "Learn" },
  { href: "/podcasts", icon: Mic, color: "#06B6D4", tint: "#CFFAFE", label: "Podcasts" },
  { href: "/discover", icon: Compass, color: "#F59E0B", tint: "#FEF3C7", label: "Discover" },
  { href: "/profile", icon: User, color: "#10B981", tint: "#D1FAE5", label: "Profile" },
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

  return (
    <div className="min-h-screen bg-bg lg:flex">
      {profile && <NotificationPermissionModal pushEnabled={!!profile.notification_settings?.push_enabled} />}

      <Sidebar profile={profile} hasUnread={hasUnread} />

      {/* Sidebar is fixed and out of flow, so the content column offsets past it. */}
      <div className="flex min-h-screen flex-1 flex-col pb-20 lg:pb-0 lg:pl-64">
        <TopBar profile={profile} hasUnread={hasUnread} />

        <div className="flex-1 lg:mx-auto lg:flex lg:w-full lg:max-w-[1440px] lg:gap-10 lg:px-10 lg:py-8">
          <main className="flex-1 px-4 py-4 lg:min-w-0 lg:max-w-3xl lg:px-0 lg:py-0">{children}</main>
          <RightRail profile={profile} />
        </div>

        {/* Mobile bottom tabs — desktop navigates from the sidebar instead */}
        <nav className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
          <div className="mx-auto flex max-w-[520px] border-t border-gray-200 bg-white">
            {NAV_TABS.map((tab) => {
              const active = pathname.startsWith(tab.href);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-label={tab.label}
                  className="flex flex-1 flex-col items-center gap-1 pb-2.5 pt-3 transition-transform active:scale-90"
                >
                  <Icon
                    className="h-5 w-5 transition-colors"
                    style={{ color: active ? tab.color : "#9CA3AF" }}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span
                    className="text-[10px] font-bold transition-colors"
                    style={{ color: active ? tab.color : "#9CA3AF" }}
                  >
                    {tab.label}
                  </span>
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
