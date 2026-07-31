"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { toggleFollow } from "@/lib/actions/follows";
import { getLevelTitle } from "@/lib/levels";
import GameCard from "@/components/ui/GameCard";
import LevelBadge from "@/components/ui/LevelBadge";
import XPBar from "@/components/ui/XPBar";
import GradientButton from "@/components/ui/GradientButton";
import AchievementsGrid from "@/components/profile/AchievementsGrid";
import ActivityTimeline from "@/components/profile/ActivityTimeline";
import PostsGrid from "@/components/profile/PostsGrid";
import ReportButton from "@/components/ReportButton";

interface PublicProfile {
  id: string;
  first_name: string;
  headline: string | null;
  dream: string | null;
  level: number;
  xp: number;
  current_streak: number;
  interests: string[];
  school_id: string | null;
  school_type: string | null;
  privacy_settings: { hide_activity?: boolean; hide_posts?: boolean; hide_dream?: boolean } | null;
}

const SCHOOL_TYPE_LABEL: Record<string, string> = {
  homeschool: "Homeschooled",
  no_school_yet: "No school yet",
};

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-base font-black text-white">{value}</p>
      <p className="text-[9px] font-bold uppercase tracking-wide text-text-muted">{label}</p>
    </div>
  );
}

export default function PublicProfilePage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const { profile: myProfile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);

  const [target, setTarget] = useState<PublicProfile | null>(null);
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [stats, setStats] = useState({ posts: 0, following: 0, followers: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (myProfile && params.userId === myProfile.id) {
      router.replace("/profile");
    }
  }, [myProfile, params.userId, router]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("profiles")
        .select(
          "id, first_name, headline, dream, level, xp, current_streak, interests, school_id, school_type, privacy_settings"
        )
        .eq("id", params.userId)
        .maybeSingle();
      setTarget(data);

      if (data) {
        const [{ count: posts }, { count: following }, { count: followers }] = await Promise.all([
          supabase.from("posts").select("id", { count: "exact", head: true }).eq("author_id", data.id),
          supabase
            .from("follows")
            .select("follower_id", { count: "exact", head: true })
            .eq("follower_id", data.id),
          supabase
            .from("follows")
            .select("following_id", { count: "exact", head: true })
            .eq("following_id", data.id),
        ]);
        setStats({ posts: posts ?? 0, following: following ?? 0, followers: followers ?? 0 });

        if (data.school_id) {
          const { data: school } = await supabase
            .from("schools")
            .select("name")
            .eq("id", data.school_id)
            .maybeSingle();
          setSchoolName(school?.name ?? null);
        }

        if (myProfile) {
          const { data: followRow } = await supabase
            .from("follows")
            .select("follower_id")
            .eq("follower_id", myProfile.id)
            .eq("following_id", data.id)
            .maybeSingle();
          setIsFollowing(!!followRow);
        }
      }
      setLoading(false);
    }
    load();
  }, [params.userId, myProfile, supabase]);

  function handleToggleFollow() {
    if (!target) return;
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    startTransition(async () => {
      try {
        await toggleFollow(target.id);
      } catch {
        setIsFollowing(wasFollowing);
      }
    });
  }

  if (loading) return <p className="text-sm font-bold text-text-muted">Loading profile...</p>;
  if (!target) return <p className="text-sm font-bold text-text-muted">This member couldn&apos;t be found.</p>;

  const privacy = target.privacy_settings ?? {};
  const schoolLabel =
    target.school_type === "school" ? schoolName : SCHOOL_TYPE_LABEL[target.school_type ?? ""] ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div
        className="relative h-24 overflow-hidden rounded-[18px] border-4 border-pink"
        style={{ background: "linear-gradient(135deg, #ff6b9d, #a78bfa, #38bdf8)" }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0 2px, transparent 2px 14px)" }}
        />
      </div>

      <GameCard borderColor="purple" glowColor="purple" className="-mt-16 flex flex-col items-center gap-2 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-pink bg-gradient-pink-purple text-4xl font-black text-white shadow-glow-pink">
          {target.first_name.charAt(0).toUpperCase()}
        </div>
        <h1 className="heading-game text-2xl">{target.first_name}</h1>
        <LevelBadge level={target.level} size="md" />
        {target.headline && <p className="text-sm font-bold text-text-muted">{target.headline}</p>}
        {schoolLabel && <p className="text-xs font-bold text-sky">🏫 {schoolLabel}</p>}
        {target.current_streak > 0 && (
          <p className="text-xs font-black text-orange">🔥 {target.current_streak}-day streak</p>
        )}

        <div className="mt-3 grid w-full grid-cols-4 gap-2 border-t-3 border-border pt-3">
          <StatBox label="Posts" value={stats.posts} />
          <StatBox label="Following" value={stats.following} />
          <StatBox label="Followers" value={stats.followers} />
          <StatBox label="XP" value={target.xp} />
        </div>

        {myProfile && (
          <div className="mt-3 flex w-full items-center gap-2">
            <GradientButton
              variant={isFollowing ? "sky" : "pink"}
              size="sm"
              className="flex-1"
              onClick={handleToggleFollow}
            >
              {isFollowing ? "Following ✓" : "Follow"}
            </GradientButton>
            <ReportButton reportedType="profile" reportedId={target.id} />
          </div>
        )}
      </GameCard>

      <GameCard borderColor="yellow" glowColor="yellow">
        <p className="mb-2 text-xs font-black uppercase text-text-muted">
          Level {target.level} · {getLevelTitle(target.level)}
        </p>
        <XPBar level={target.level} xp={target.xp} />
      </GameCard>

      {!privacy.hide_dream && target.dream && (
        <GameCard borderColor="pink" glowColor="pink">
          <p className="mb-2 text-xs font-black uppercase tracking-wide text-pink">💭 Dream</p>
          <p className="text-sm font-bold italic text-white">&ldquo;{target.dream}&rdquo;</p>
        </GameCard>
      )}

      {target.interests.length > 0 && (
        <div>
          <p className="mb-3 font-black uppercase tracking-wide text-white">✨ Interests</p>
          <div className="flex flex-wrap gap-2">
            {target.interests.map((tag) => (
              <span
                key={tag}
                className="rounded-full border-3 border-sky px-3 py-1 text-xs font-black uppercase text-sky"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <AchievementsGrid userId={target.id} />
      {!privacy.hide_activity && <ActivityTimeline userId={target.id} />}
      {!privacy.hide_posts && <PostsGrid userId={target.id} />}
    </div>
  );
}
