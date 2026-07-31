"use client";

import Link from "next/link";
import { useProfile } from "@/hooks/useProfile";
import Card from "@/components/ui/GameCard";
import SectionTitle from "@/components/ui/SectionTitle";
import { BookOpen, MessageCircle, Compass, ChevronRight } from "lucide-react";

export default function HomePage() {
  const { profile } = useProfile();

  if (!profile) {
    return (
      <div className="flex flex-col gap-4">
        <div className="skeleton-shimmer h-20 rounded-xl" />
        <div className="skeleton-shimmer h-32 rounded-xl" />
        <div className="skeleton-shimmer h-32 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Hey {profile.first_name}!
        </h1>
        <p className="text-sm text-gray-500">Welcome back to LinkY101</p>
      </div>

      {/* Streak card */}
      <Card className="flex items-center gap-3 bg-gradient-to-r from-[#FFF9E6] to-[#FFF3CC]">
        <span className="text-2xl">🔥</span>
        <div>
          <p className="font-bold text-gray-900">{profile.current_streak || 0} day streak</p>
          <p className="text-xs text-gray-500">Keep learning to grow your streak</p>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/learn" className="card flex flex-col items-center gap-2 py-4 text-center transition-transform active:scale-[0.97]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F5E9]">
            <BookOpen className="h-5 w-5 text-[#2ECC71]" />
          </div>
          <span className="text-xs font-semibold text-gray-700">Start Learning</span>
        </Link>
        <Link href="/community" className="card flex flex-col items-center gap-2 py-4 text-center transition-transform active:scale-[0.97]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0F0]">
            <MessageCircle className="h-5 w-5 text-[#FF6B6B]" />
          </div>
          <span className="text-xs font-semibold text-gray-700">Post an Idea</span>
        </Link>
        <Link href="/discover" className="card flex flex-col items-center gap-2 py-4 text-center transition-transform active:scale-[0.97]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFFDE7]">
            <Compass className="h-5 w-5 text-[#F5A623]" />
          </div>
          <span className="text-xs font-semibold text-gray-700">Discover</span>
        </Link>
      </div>

      {/* Continue Learning */}
      <div>
        <SectionTitle emoji="📚" title="Continue Learning" actionLabel="See all" actionHref="/learn" />
        <Link href="/learn" className="mt-2 block">
          <Card className="flex items-center gap-3 transition-transform active:scale-[0.98]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E3F2FD]">
              <BookOpen className="h-6 w-6 text-[#039BE5]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900">Business Basics</p>
              <p className="text-xs text-gray-500">Pick up where you left off</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
          </Card>
        </Link>
      </div>

      {/* Your Progress */}
      <div>
        <SectionTitle emoji="📊" title="Your Progress" />
        <Card className="mt-2">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500">Lessons Done</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500">Quizzes Passed</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{profile.current_streak || 0}</p>
              <p className="text-xs text-gray-500">Day Streak</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Trending in Community */}
      <div>
        <SectionTitle emoji="🔥" title="Trending Ideas" actionLabel="See all" actionHref="/community" />
        <Card className="mt-2">
          <p className="text-sm text-gray-500">See what other young entrepreneurs are working on</p>
          <Link href="/community" className="mt-2 inline-block text-sm font-semibold text-[#039BE5]">
            Visit Community →
          </Link>
        </Card>
      </div>
    </div>
  );
}
