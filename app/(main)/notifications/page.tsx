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
            className="text-xs font-bold text-[#039BE5]"
          >
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm font-semibold text-gray-400">Loading...</p>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <span className="text-4xl">🔔</span>
          <p className="mt-2 font-bold text-gray-900">All caught up</p>
          <p className="text-sm text-gray-500">Nothing new right now — go build something.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => handleTap(n)}
              className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left shadow-sm transition-transform active:scale-[0.98] ${
                n.is_read ? "border-gray-200 bg-white" : "border-[#039BE5] bg-[#F0F9FF]"
              }`}
            >
              <span className="text-xl">{TYPE_ICON[n.type] ?? "🔔"}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900">{n.title}</p>
                {n.body && <p className="text-xs text-gray-500">{n.body}</p>}
                <p className="mt-1 text-[11px] text-gray-400">{timeAgo(n.created_at)}</p>
              </div>
              {!n.is_read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#039BE5]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
