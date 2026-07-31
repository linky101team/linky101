"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import SectionTitle from "@/components/ui/SectionTitle";

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const TYPE_ICON: Record<string, string> = {
  reaction_received: "🔥",
  comment_received: "💬",
  level_up: "⬆️",
  achievement_earned: "🏅",
  team_challenge_update: "⚔️",
  new_opportunity: "🎯",
  mentor_answered: "🤝",
  daily_tasks_reminder: "✅",
  streak_at_risk: "🔥",
  event_starting: "🎤",
  warning: "⚠️",
};

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const { profile } = useProfile();
  const router = useRouter();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("notifications")
      .select("id, type, title, body, link, is_read, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setNotifications(data ?? []);
        setLoading(false);
      });
  }, [profile, supabase]);

  async function handleTap(n: NotificationRow) {
    if (!n.is_read) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
    }
    if (n.link) router.push(n.link);
  }

  async function handleMarkAllRead() {
    if (!profile) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", profile.id).eq("is_read", false);
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <SectionTitle emoji="🔔" title="Notifications" />
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-xs font-black uppercase tracking-wide text-sky"
          >
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm font-bold text-text-muted">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="text-sm font-bold text-text-muted">You&apos;re all caught up — no notifications yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => handleTap(n)}
              className={`flex items-start gap-3 rounded-xl border-3 p-3 text-left ${
                n.is_read ? "border-border bg-card" : "border-pink bg-pink/5 shadow-glow-pink"
              }`}
            >
              <span className="text-xl">{TYPE_ICON[n.type] ?? "🔔"}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-white">{n.title}</p>
                {n.body && <p className="text-xs font-bold text-text-muted">{n.body}</p>}
                <p className="mt-1 text-[10px] font-bold uppercase text-text-muted">{timeAgo(n.created_at)}</p>
              </div>
              {!n.is_read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-pink" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
