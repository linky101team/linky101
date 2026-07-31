"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, BookOpen, Users, Compass, User } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { createClientSupabase } from "@/lib/supabase/client";
import InstallPrompt from "@/components/InstallPrompt";
import NotificationPermissionModal from "@/components/NotificationPermissionModal";
import LinkyChat from "@/components/LinkyChat";

const TABS = [
  { href: "/home", icon: Home },
  { href: "/learn", icon: BookOpen },
  { href: "/community", icon: Users },
  { href: "/discover", icon: Compass },
  { href: "/profile", icon: User },
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
    <div className="flex min-h-screen flex-col pb-20">
      {profile && <NotificationPermissionModal pushEnabled={!!profile.notification_settings?.push_enabled} />}

      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-3">
        <span className="font-bold text-lg text-ink">
          Link<span className="text-[#FF6B6B]">Y</span>101
        </span>

        <div className="flex items-center gap-3">
          <Link href="/notifications" aria-label="Notifications" className="relative p-1 text-ink">
            <Bell className="h-5 w-5" strokeWidth={2} />
            {hasUnread && (
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-[#FF6B6B]" />
            )}
          </Link>

          <Link href="/profile" aria-label="Profile">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.first_name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF6B6B] text-sm font-bold text-white">
                {initial}
              </div>
            )}
          </Link>
        </div>
      </header>

      <main className="flex-1 px-5 py-4">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40">
        <div className="mx-auto flex max-w-[430px] border-t border-gray-200 bg-white">
          {TABS.map((tab) => {
            const active = pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-1 flex-col items-center gap-1 py-3 transition-colors"
              >
                <Icon
                  className={`h-5 w-5 ${active ? "text-[#FF6B6B]" : "text-gray-400"}`}
                  strokeWidth={active ? 2.5 : 2}
                />
                {active && (
                  <span className="h-1 w-1 rounded-full bg-[#FF6B6B]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <InstallPrompt />
      <LinkyChat />
    </div>
  );
}
