"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";

interface Challenge {
  id: string;
  title: string;
  ends_at: string;
  xp_reward_per_member: number;
  goal_value: number;
}

export default function ActiveChallengeBanner() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const nowIso = new Date().toISOString();
      const { data } = await supabase
        .from("team_challenges")
        .select("id, title, ends_at, xp_reward_per_member, goal_value")
        .lte("starts_at", nowIso)
        .gte("ends_at", nowIso)
        .order("ends_at")
        .limit(1)
        .maybeSingle();

      if (data) {
        setChallenge(data);
        if (profile?.school_id) {
          const { data: prog } = await supabase
            .from("team_challenge_progress")
            .select("progress_value")
            .eq("challenge_id", data.id)
            .eq("school_id", profile.school_id)
            .maybeSingle();
          setProgress(prog?.progress_value ?? 0);
        }
      }
      setLoading(false);
    }

    load();
  }, [profile?.school_id, supabase]);

  useEffect(() => {
    if (!challenge) return;

    function tick() {
      const diff = new Date(challenge!.ends_at).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Ended");
        return;
      }
      const days = Math.floor(diff / 86_400_000);
      const hours = Math.floor((diff % 86_400_000) / 3_600_000);
      setTimeLeft(days > 0 ? `${days}d ${hours}h left` : `${hours}h left`);
    }

    tick();
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, [challenge]);

  if (loading || !challenge) return null;

  const pct = Math.min(100, (progress / challenge.goal_value) * 100);

  return (
    <div className="rounded-[18px] border-3 border-pink bg-gradient-pink-purple p-4 shadow-glow-pink">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wide text-white/80">
          ⚔️ Active Challenge
        </span>
        <span className="text-xs font-black text-white">{timeLeft}</span>
      </div>
      <p className="heading-game mb-2 text-lg text-white">{challenge.title}</p>
      <div className="mb-1 h-3 w-full overflow-hidden rounded-full bg-navy/40">
        <div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between text-xs font-bold text-white/90">
        <span>
          {progress} / {challenge.goal_value}
        </span>
        <span>+{challenge.xp_reward_per_member} XP per member</span>
      </div>
    </div>
  );
}
