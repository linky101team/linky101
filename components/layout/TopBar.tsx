"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Flame, X, MessageCircleQuestion, Mic, Rocket, Trophy } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import type { Profile } from "@/hooks/useProfile";

/** A real notification aimed at this person, e.g. "your question was answered". */
interface PersonalNotification {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

interface TopBarProps {
  profile: Profile | null;
  hasUnread: boolean;
}

interface Update {
  icon: typeof Bell;
  tint: string;
  color: string;
  title: string;
  body: string;
  href: string;
}

/**
 * Platform announcements — the "what's happening / do this next" panel behind
 * the bell. Deliberately NOT a feed of other users' posts: these are prompts
 * and drops that pull someone back into the product.
 */
function buildUpdates(streak: number, longest: number): Update[] {
  const updates: Update[] = [
    {
      icon: Trophy,
      tint: "bg-[#F3E8FF]",
      color: "#7C3AED",
      title: "Top 20 Questions of the Week are live",
      body: "This week's most-voted questions have been answered. Go see them.",
      href: "/discover?section=ask",
    },
    {
      icon: Rocket,
      tint: "bg-[#FCE7F3]",
      color: "#EC4899",
      title: "How to pitch your idea — start now!",
      body: "Build a pitch deck in 5 guided steps. Takes about 10 minutes.",
      href: "/discover?section=tools",
    },
    {
      icon: Mic,
      tint: "bg-[#CFFAFE]",
      color: "#06B6D4",
      title: "New podcast episode",
      body: "A real founder story just dropped. Listen on your way to school.",
      href: "/podcasts",
    },
    {
      icon: MessageCircleQuestion,
      tint: "bg-[#FEF3C7]",
      color: "#B45309",
      title: "Got a question? Ask LinkY AI",
      body: "Instant feedback on anything — pricing, marketing, getting started.",
      href: "/discover?section=ask",
    },
  ];

  if (streak > 0 && longest > streak) {
    updates.unshift({
      icon: Flame,
      tint: "bg-[#FFEDD5]",
      color: "#EA580C",
      title: `You're ${longest - streak} day${longest - streak === 1 ? "" : "s"} off your record`,
      body: `Your best streak is ${longest} days. Keep today going.`,
      href: "/learn",
    });
  }

  return updates;
}

export default function TopBar({ profile, hasUnread }: TopBarProps) {
  const [open, setOpen] = useState(false);
  const supabase = useMemo(() => createClientSupabase(), []);
  // Things that happened TO this person, as opposed to the platform
  // announcements below. These used to only exist on /notifications, so
  // "your question was answered" never reached the bell — which is the one
  // place anyone actually looks.
  const [personal, setPersonal] = useState<PersonalNotification[]>([]);
  const initial = profile?.first_name?.charAt(0).toUpperCase() ?? "?";
  const streak = profile?.current_streak ?? 0;
  const longest = profile?.longest_streak ?? 0;
  const updates = buildUpdates(streak, longest);

  const loadPersonal = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from("notifications")
      .select("id, title, body, link, is_read, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(10);
    setPersonal((data ?? []) as PersonalNotification[]);
  }, [profile, supabase]);

  useEffect(() => {
    loadPersonal();
  }, [loadPersonal]);

  const unreadCount = personal.filter((n) => !n.is_read).length;

  async function markRead(id: string) {
    setPersonal((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5 lg:px-8">
        {/* Streak — the thing you're proud of, front and centre on the left */}
        <div className="flex items-center gap-1.5 rounded-full bg-[#FFF7ED] px-3 py-1.5">
          <Flame className="h-5 w-5 text-[#F97316]" strokeWidth={2.5} fill="#FB923C" />
          <span className="text-sm font-extrabold text-[#C2410C]">{streak}</span>
        </div>

        {/* LinkY black, 101 gold. Not a gradient, not red. */}
        <Link href="/home" className="text-lg font-extrabold tracking-tight text-[#111111] lg:hidden">
          LinkY<span className="text-[#F5B301]">101</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
          >
            <Bell className="h-5 w-5 text-[#1E1B4B]" strokeWidth={2} />
            {unreadCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EC4899] px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            ) : (
              (hasUnread || updates.length > 0) && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#EC4899]" />
              )
            )}
          </button>

          <Link href="/profile" aria-label="Your profile">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.first_name}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="grad-brand flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white">
                {initial}
              </div>
            )}
          </Link>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 p-4 pt-16 sm:items-center sm:pt-4"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring", damping: 24, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[75vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-[#1E1B4B]">Notifications</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close notifications"
                  className="text-gray-400 transition-colors hover:text-gray-600"
                >
                  <X className="h-5 w-5" strokeWidth={2.5} />
                </button>
              </div>

              {personal.length > 0 && (
                <div className="mb-4 flex flex-col gap-2">
                  {personal.map((n) => (
                    <Link
                      key={n.id}
                      href={n.link ?? "/notifications"}
                      onClick={() => {
                        markRead(n.id);
                        setOpen(false);
                      }}
                      className={`flex items-start gap-3 rounded-2xl border p-3 transition-colors ${
                        n.is_read
                          ? "border-gray-100 hover:bg-gray-50"
                          : "border-[#7C3AED]/30 bg-[#F5F3FF]"
                      }`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D1FAE5]">
                        <MessageCircleQuestion className="h-5 w-5 text-[#047857]" strokeWidth={2.25} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-[#1E1B4B]">{n.title}</span>
                        {n.body && (
                          <span className="block text-xs leading-relaxed text-gray-500">{n.body}</span>
                        )}
                      </span>
                      {!n.is_read && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#7C3AED]" />
                      )}
                    </Link>
                  ))}
                </div>
              )}

              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                What&apos;s new
              </p>

              <div className="flex flex-col gap-2">
                {updates.map((u) => (
                  <Link
                    key={u.title}
                    href={u.href}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 rounded-2xl border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${u.tint}`}>
                      <u.icon className="h-5 w-5" style={{ color: u.color }} strokeWidth={2.25} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-[#1E1B4B]">{u.title}</span>
                      <span className="block text-xs leading-relaxed text-gray-500">{u.body}</span>
                    </span>
                  </Link>
                ))}
              </div>

              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="mt-3 block rounded-2xl bg-[#F5F3FF] py-2.5 text-center text-sm font-bold text-[#7C3AED]"
              >
                See all activity
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
