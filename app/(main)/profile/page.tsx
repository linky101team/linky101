"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Pencil, Settings } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile, useProfileStore } from "@/hooks/useProfile";
import { getLevelTitle } from "@/lib/levels";
import GameCard from "@/components/ui/GameCard";
import LevelBadge from "@/components/ui/LevelBadge";
import XPBar from "@/components/ui/XPBar";
import GradientButton from "@/components/ui/GradientButton";
import AchievementsGrid from "@/components/profile/AchievementsGrid";
import ActivityTimeline from "@/components/profile/ActivityTimeline";
import PostsGrid from "@/components/profile/PostsGrid";
import TutorialPrompt from "@/components/TutorialPrompt";

const SCHOOL_TYPE_LABEL: Record<string, string> = {
  homeschool: "Homeschooled",
  no_school_yet: "No school yet",
};

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-base font-black text-ink">{value}</p>
      <p className="text-[9px] font-bold uppercase tracking-wide text-text-muted">{label}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { profile } = useProfile();
  const clearProfile = useProfileStore((s) => s.clearProfile);
  const router = useRouter();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [stats, setStats] = useState({ posts: 0, following: 0, followers: 0 });

  useEffect(() => {
    if (!profile) return;

    async function load() {
      const [{ count: posts }, { count: following }, { count: followers }] = await Promise.all([
        supabase.from("posts").select("id", { count: "exact", head: true }).eq("author_id", profile!.id),
        supabase
          .from("follows")
          .select("follower_id", { count: "exact", head: true })
          .eq("follower_id", profile!.id),
        supabase
          .from("follows")
          .select("following_id", { count: "exact", head: true })
          .eq("following_id", profile!.id),
      ]);
      setStats({ posts: posts ?? 0, following: following ?? 0, followers: followers ?? 0 });

      if (profile!.school_id) {
        const { data: school } = await supabase
          .from("schools")
          .select("name")
          .eq("id", profile!.school_id)
          .maybeSingle();
        setSchoolName(school?.name ?? null);
      }
    }
    load();
  }, [profile, supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    clearProfile();
    router.push("/login");
    router.refresh();
  }

  if (!profile) {
    return <p className="text-sm font-bold text-text-muted">Loading profile...</p>;
  }

  const schoolLabel =
    profile.school_type === "school" ? schoolName : SCHOOL_TYPE_LABEL[profile.school_type ?? ""] ?? null;

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

      <div data-tour="profile-header">
        <GameCard
          borderColor="purple"
          glowColor="purple"
          className="-mt-16 flex flex-col items-center gap-2 text-center"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-pink bg-gradient-pink-purple text-4xl font-black text-white shadow-glow-pink">
            {profile.first_name.charAt(0).toUpperCase()}
          </div>
          <h1 className="heading-game text-2xl">{profile.first_name}</h1>
          <LevelBadge level={profile.level} size="md" interactive />
          {profile.headline && <p className="text-sm font-bold text-text-muted">{profile.headline}</p>}
          {schoolLabel && <p className="text-xs font-bold text-sky">🏫 {schoolLabel}</p>}
          {profile.current_streak > 0 && (
            <p className="text-xs font-black text-orange">🔥 {profile.current_streak}-day streak</p>
          )}

          <div className="mt-3 grid w-full grid-cols-4 gap-2 border-t-3 border-border pt-3">
            <StatBox label="Posts" value={stats.posts} />
            <StatBox label="Following" value={stats.following} />
            <StatBox label="Followers" value={stats.followers} />
            <StatBox label="XP" value={profile.xp} />
          </div>
        </GameCard>
      </div>

      <div data-tour="profile-xp">
        <GameCard borderColor="yellow" glowColor="yellow">
          <p className="mb-2 text-xs font-black uppercase text-text-muted">
            Level {profile.level} · {getLevelTitle(profile.level)}
          </p>
          <XPBar level={profile.level} xp={profile.xp} />
        </GameCard>
      </div>

      <div data-tour="profile-dream">
        <GameCard borderColor="pink" glowColor="pink">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wide text-pink">💭 My Dream</span>
            <Link href="/profile/settings" className="text-text-muted" aria-label="Edit dream">
              <Pencil className="h-4 w-4" />
            </Link>
          </div>
          {profile.dream ? (
            <>
              <p className="mb-3 text-sm font-bold italic text-ink">&ldquo;{profile.dream}&rdquo;</p>
              <div className="flex gap-3 text-lg">
                <button type="button" className="transition-transform active:scale-125">
                  🔥
                </button>
                <button type="button" className="transition-transform active:scale-125">
                  💡
                </button>
                <button type="button" className="transition-transform active:scale-125">
                  ❤️
                </button>
              </div>
            </>
          ) : (
            <Link href="/profile/settings" className="text-sm font-bold text-text-muted">
              Add your dream →
            </Link>
          )}
        </GameCard>
      </div>

      {profile.interests.length > 0 && (
        <div data-tour="profile-interests">
          <p className="mb-3 font-black uppercase tracking-wide text-ink">✨ Interests</p>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((tag) => (
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

      <AchievementsGrid userId={profile.id} />
      <ActivityTimeline userId={profile.id} />
      <PostsGrid userId={profile.id} />

      <div data-tour="profile-shop">
        <Link href="/shop">
          <GradientButton variant="yellow" className="w-full">
            <span className="flex items-center justify-center gap-2">
              🛍️ SHOP <span className="text-ink">· 🪙 {profile.link_coins}</span>
            </span>
          </GradientButton>
        </Link>
      </div>

      <div className="flex gap-2">
        <Link href="/premium" className="flex-1">
          <GradientButton variant="pink" className="w-full">
            ✨ Premium
          </GradientButton>
        </Link>
        <Link href="/profile/flair" className="flex-1">
          <GradientButton variant="purple" className="w-full">
            🎨 Flair
          </GradientButton>
        </Link>
      </div>

      <div data-tour="profile-settings">
        <Link href="/profile/settings">
          <GradientButton variant="sky" className="w-full">
            <span className="flex items-center justify-center gap-2">
              <Settings className="h-4 w-4" strokeWidth={3} /> Settings
            </span>
          </GradientButton>
        </Link>
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        className="flex items-center justify-center gap-2 rounded-xl border-3 border-border py-2 text-xs font-black uppercase text-text-muted"
      >
        <LogOut className="h-3.5 w-3.5" /> Sign Out
      </button>

      <TutorialPrompt tourId="profile" />
    </div>
  );
}
