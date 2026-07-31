"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile, useProfileStore } from "@/hooks/useProfile";
import { joinEvent, leaveEvent } from "@/lib/actions/events";
import GameCard, { type GameCardColor } from "@/components/ui/GameCard";

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  starts_at: string;
  ends_at: string;
  xp_reward: number;
  max_attendees: number | null;
}

type EventStatus = "live" | "upcoming" | "completed";

function getStatus(e: EventRow): EventStatus {
  const now = Date.now();
  const start = new Date(e.starts_at).getTime();
  const end = new Date(e.ends_at).getTime();
  if (now < start) return "upcoming";
  if (now > end) return "completed";
  return "live";
}

const STATUS_STYLE: Record<EventStatus, { border: GameCardColor; glow?: GameCardColor; label: string; color: string }> = {
  live: { border: "green", glow: "green", label: "🔴 LIVE", color: "text-green" },
  upcoming: { border: "sky", glow: "sky", label: "Upcoming", color: "text-sky" },
  completed: { border: "border", label: "Completed", color: "text-text-muted" },
};

export default function EventsSection() {
  const { profile } = useProfile();
  const refreshProfile = useProfileStore((s) => s.refreshProfile);
  const supabase = useMemo(() => createClientSupabase(), []);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [attending, setAttending] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!profile) return;
    async function load() {
      const { data } = await supabase
        .from("events")
        .select("id, title, description, event_type, starts_at, ends_at, xp_reward, max_attendees")
        .order("starts_at", { ascending: true });

      setEvents(data ?? []);

      if (data && data.length > 0) {
        const { data: mine } = await supabase
          .from("event_attendees")
          .select("event_id")
          .eq("user_id", profile!.id)
          .in(
            "event_id",
            data.map((e) => e.id)
          );
        setAttending(new Set((mine ?? []).map((m) => m.event_id)));
      }
      setLoading(false);
    }
    load();
  }, [profile, supabase]);

  function handleJoin(eventId: string) {
    setAttending((prev) => new Set(prev).add(eventId));
    startTransition(async () => {
      try {
        await joinEvent(eventId);
        refreshProfile();
      } catch {
        setAttending((prev) => {
          const next = new Set(prev);
          next.delete(eventId);
          return next;
        });
      }
    });
  }

  function handleLeave(eventId: string) {
    setAttending((prev) => {
      const next = new Set(prev);
      next.delete(eventId);
      return next;
    });
    startTransition(async () => {
      try {
        await leaveEvent(eventId);
      } catch {
        setAttending((prev) => new Set(prev).add(eventId));
      }
    });
  }

  if (loading || events.length === 0) return null;

  return (
    <div>
      <p className="mb-3 font-black uppercase tracking-wide text-ink">🎤 Events</p>
      <div className="flex flex-col gap-3">
        {events.map((e) => {
          const status = getStatus(e);
          const style = STATUS_STYLE[status];
          const isAttending = attending.has(e.id);
          return (
            <GameCard key={e.id} borderColor={style.border} glowColor={style.glow}>
              <div className="mb-1 flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-wide ${style.color}`}>
                  {style.label}
                </span>
                <span className="text-xs font-black text-yellow">+{e.xp_reward} XP</span>
              </div>
              <p className="heading-game mb-1 text-base">{e.title}</p>
              {e.description && <p className="mb-2 text-sm font-bold text-text-muted">{e.description}</p>}
              {status !== "completed" && (
                <button
                  type="button"
                  onClick={() => (isAttending ? handleLeave(e.id) : handleJoin(e.id))}
                  className={`w-full rounded-xl border-3 py-2 text-xs font-black uppercase ${
                    isAttending
                      ? "border-border bg-navy/40 text-text-muted"
                      : "border-pink bg-gradient-pink-purple text-white"
                  }`}
                >
                  {isAttending ? "Registered ✓ (tap to cancel)" : "Join Event"}
                </button>
              )}
            </GameCard>
          );
        })}
      </div>
    </div>
  );
}
