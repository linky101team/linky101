"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { createClientSupabase } from "@/lib/supabase/client";
import LevelBadge from "@/components/ui/LevelBadge";
import XPBar from "@/components/ui/XPBar";
import WelcomeBack from "@/components/WelcomeBack";
import InstallPrompt from "@/components/InstallPrompt";
import NotificationPermissionModal from "@/components/NotificationPermissionModal";
import LinkyChat from "@/components/LinkyChat";
import LevelProgressModal from "@/components/LevelProgressModal";
import FloatingRewards from "@/components/FloatingRewards";

const TABS = [
  { href: "/home", label: "Home", emoji: "🏠" },
  { href: "/learn", label: "Learn", emoji: "📚" },
  { href: "/community", label: "Community", emoji: "👥" },
  { href: "/discover", label: "Discover", emoji: "🔍" },
  { href: "/teams", label: "Teams", emoji: "🏫" },
  { href: "/profile", label: "Profile", emoji: "👤" },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useProfile();
  const pathname = usePathname();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [hasUnread, setHasUnread] = useState(false);
  const [activeWarning, setActiveWarning] = useState<{
    warning_type: string;
    reason: string | null;
    expires_at: string | null;
  } | null>(null);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("is_read", false)
      .then(({ count }) => setHasUnread((count ?? 0) > 0));

    supabase
      .from("user_warnings")
      .select("warning_type, reason, expires_at")
      .eq("user_id", profile.id)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order("issued_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setActiveWarning(data));
  }, [profile, supabase]);

  if (loading && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-black uppercase text-text-muted">Loading...</p>
      </div>
    );
  }

  const initial = profile?.first_name?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="flex min-h-screen flex-col pb-24">
      {profile && <WelcomeBack firstName={profile.first_name} />}
      {profile && <NotificationPermissionModal pushEnabled={!!profile.notification_settings?.push_enabled} />}

      <header data-tour="home-topbar" className="flex flex-col gap-3 border-b-3 border-border bg-card px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.first_name}
                className="h-11 w-11 shrink-0 rounded-full border-3 border-pink object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-3 border-pink bg-gradient-pink-purple font-black text-white shadow-glow-pink">
                {initial}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-black uppercase text-ink">
                {profile?.first_name ?? "Member"}
              </p>
              <LevelBadge level={profile?.level ?? 1} size="sm" interactive />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="flex items-center gap-1 rounded-full border-3 border-orange bg-navy/60 px-2 py-1 text-xs font-black text-orange">
              🔥 {profile?.current_streak ?? 0}
            </span>
            <span className="flex items-center gap-1 rounded-full border-3 border-yellow bg-navy/60 px-2 py-1 text-xs font-black text-yellow">
              ⭐ {profile?.xp ?? 0}
            </span>
            <Link href="/notifications" aria-label="Notifications" className="relative p-1 text-ink">
              <Bell className="h-5 w-5" strokeWidth={2.5} />
              {hasUnread && (
                <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border border-card bg-orange" />
              )}
            </Link>
          </div>
        </div>

        <XPBar level={profile?.level ?? 1} xp={profile?.xp ?? 0} showLabel={false} />
      </header>

      {activeWarning && (
        <div className="border-b-3 border-orange bg-orange/10 px-5 py-2 text-center text-xs font-black uppercase text-orange">
          ⚠️ {activeWarning.warning_type.replace("_", " ")}
          {activeWarning.reason ? `: ${activeWarning.reason}` : ""}
          {activeWarning.expires_at &&
            ` (until ${new Date(activeWarning.expires_at).toLocaleDateString()})`}
        </div>
      )}

      <main className="flex-1 px-5 py-4">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40">
        <div className="mx-auto flex max-w-[430px] border-t border-[#90CAF9] bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
          {TABS.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-extrabold uppercase tracking-wide transition-transform active:scale-95 ${
                  active ? "text-sky" : "text-[#9CA3AF]"
                }`}
              >
                <span className="text-[24px] leading-none">{tab.emoji}</span>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <InstallPrompt />
      <LinkyChat />
      <LevelProgressModal />
      <FloatingRewards />
    </div>
  );
}
