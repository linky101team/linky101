"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { toggleFollow } from "@/lib/actions/follows";
import Card from "@/components/ui/GameCard";
import GradientButton from "@/components/ui/GradientButton";
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
    <div className="text-center">
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-[10px] text-gray-500">{label}</p>
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

  if (loading) return <p className="text-sm font-semibold text-gray-400">Loading profile...</p>;
  if (!target)
    return <p className="text-sm font-semibold text-gray-400">This member couldn&apos;t be found.</p>;

  const privacy = target.privacy_settings ?? {};
  const schoolLabel =
    target.school_type === "school" ? schoolName : SCHOOL_TYPE_LABEL[target.school_type ?? ""] ?? null;

  return (
    <div className="flex flex-col gap-5 pb-16">
      <Card className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1A1A2E] text-3xl font-bold text-white">
          {target.first_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{target.first_name}</h1>
          {target.headline && <p className="mt-0.5 text-sm text-gray-500">{target.headline}</p>}
          {schoolLabel && (
            <p className="mt-1 flex items-center justify-center gap-1 text-xs text-gray-400">
              <MapPin className="h-3 w-3" /> {schoolLabel}
            </p>
          )}
          {target.current_streak > 0 && (
            <p className="mt-1 text-xs font-semibold text-[#F5A623]">
              🔥 {target.current_streak}-day streak
            </p>
          )}
        </div>

        <div className="mt-2 grid w-full grid-cols-3 gap-2 border-t border-gray-100 pt-3">
          <StatBox label="Posts" value={stats.posts} />
          <StatBox label="Followers" value={stats.followers} />
          <StatBox label="Following" value={stats.following} />
        </div>

        {myProfile && (
          <div className="mt-2 flex w-full items-center gap-2">
            <GradientButton
              variant={isFollowing ? "ghost-green" : "dark"}
              size="sm"
              className="flex-1"
              onClick={handleToggleFollow}
            >
              {isFollowing ? "Following ✓" : "Follow"}
            </GradientButton>
            <ReportButton reportedType="profile" reportedId={target.id} />
          </div>
        )}
      </Card>

      {!privacy.hide_dream && target.dream && (
        <Card>
          <p className="mb-1 text-xs font-semibold text-gray-400">Their Dream</p>
          <p className="text-sm italic text-gray-700">&ldquo;{target.dream}&rdquo;</p>
        </Card>
      )}

      {target.interests.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">Interests</p>
          <div className="flex flex-wrap gap-2">
            {target.interests.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#E3F2FD] px-3 py-1 text-xs font-medium text-[#039BE5]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {!privacy.hide_activity && <ActivityTimeline userId={target.id} />}
      {!privacy.hide_posts && <PostsGrid userId={target.id} />}
    </div>
  );
}
