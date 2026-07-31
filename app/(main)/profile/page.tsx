"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, MapPin, Crown } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile, useProfileStore } from "@/hooks/useProfile";
import Card from "@/components/ui/GameCard";
import Button from "@/components/ui/GradientButton";
import ActivityTimeline from "@/components/profile/ActivityTimeline";
import PostsGrid from "@/components/profile/PostsGrid";

const SCHOOL_TYPE_LABEL: Record<string, string> = {
  homeschool: "Homeschooled",
  no_school_yet: "No school yet",
};

export default function ProfilePage() {
  const { profile } = useProfile();
  const clearProfile = useProfileStore((s) => s.clearProfile);
  const router = useRouter();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [stats, setStats] = useState({ posts: 0, following: 0, followers: 0, lessonsCompleted: 0 });

  useEffect(() => {
    if (!profile) return;

    async function load() {
      const [{ count: posts }, { count: following }, { count: followers }, { count: lessonsCompleted }] = await Promise.all([
        supabase.from("posts").select("id", { count: "exact", head: true }).eq("author_id", profile!.id),
        supabase.from("follows").select("follower_id", { count: "exact", head: true }).eq("follower_id", profile!.id),
        supabase.from("follows").select("following_id", { count: "exact", head: true }).eq("following_id", profile!.id),
        supabase.from("curriculum_progress").select("id", { count: "exact", head: true }).eq("user_id", profile!.id).eq("completed", true),
      ]);
      setStats({
        posts: posts ?? 0,
        following: following ?? 0,
        followers: followers ?? 0,
        lessonsCompleted: lessonsCompleted ?? 0,
      });

      if (profile!.school_id) {
        const { data: school } = await supabase.from("schools").select("name").eq("id", profile!.school_id).maybeSingle();
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
    return <p className="text-sm text-gray-500">Loading profile...</p>;
  }

  const schoolLabel = profile.school_type === "school" ? schoolName : SCHOOL_TYPE_LABEL[profile.school_type ?? ""] ?? null;

  return (
    <div className="flex flex-col gap-5">
      {/* Profile Header */}
      <Card className="flex flex-col items-center gap-3 text-center">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.first_name} className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1A1A2E] text-3xl font-bold text-white">
            {profile.first_name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-gray-900">{profile.first_name}</h1>
          {profile.headline && <p className="mt-0.5 text-sm text-gray-500">{profile.headline}</p>}
          {schoolLabel && (
            <p className="mt-1 flex items-center justify-center gap-1 text-xs text-gray-400">
              <MapPin className="h-3 w-3" /> {schoolLabel}
            </p>
          )}
        </div>

        <div className="mt-2 grid w-full grid-cols-4 gap-2 border-t border-gray-100 pt-3">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{stats.posts}</p>
            <p className="text-[10px] text-gray-500">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{stats.followers}</p>
            <p className="text-[10px] text-gray-500">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{stats.lessonsCompleted}</p>
            <p className="text-[10px] text-gray-500">Lessons</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{profile.current_streak || 0}</p>
            <p className="text-[10px] text-gray-500">Day Streak</p>
          </div>
        </div>
      </Card>

      {/* Dream / Bio */}
      {profile.dream && (
        <Card>
          <p className="mb-1 text-xs font-semibold text-gray-400">My Dream</p>
          <p className="text-sm text-gray-700 italic">&ldquo;{profile.dream}&rdquo;</p>
        </Card>
      )}

      {/* Interests */}
      {profile.interests && profile.interests.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">Interests</p>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((tag: string) => (
              <span key={tag} className="rounded-full bg-[#E3F2FD] px-3 py-1 text-xs font-medium text-[#039BE5]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Go Pro banner */}
      <Link
        href="/premium"
        className="flex items-center gap-3 rounded-2xl bg-[#1A1A2E] p-4 transition-transform active:scale-[0.98]"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFD93D]">
          <Crown className="h-5 w-5 text-[#1A1A2E]" strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-white">
            LinkY101 <span className="text-[#FFD93D]">Pro</span>
          </p>
          <p className="text-xs text-white/60">1-on-1 mentors, AI coach, pitch reviews & more</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#FFD93D] px-3 py-1.5 text-xs font-bold text-[#1A1A2E]">
          See inside
        </span>
      </Link>

      {/* Activity */}
      <ActivityTimeline userId={profile.id} />
      <PostsGrid userId={profile.id} />

      {/* Actions */}
      <Link href="/profile/settings">
        <Button variant="ghost-pink" className="w-full">
          <span className="flex items-center justify-center gap-2">
            <Settings className="h-4 w-4" /> Settings
          </span>
        </Button>
      </Link>

      <button
        type="button"
        onClick={handleSignOut}
        className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm text-gray-500 transition-transform active:scale-[0.97]"
      >
        <LogOut className="h-4 w-4" /> Sign Out
      </button>
    </div>
  );
}
