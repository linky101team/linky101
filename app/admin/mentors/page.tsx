"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Star } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { toggleMentorVerified, toggleMentorActive } from "@/lib/actions/adminContent";
import SectionTitle from "@/components/ui/SectionTitle";
import GameCard from "@/components/ui/GameCard";

interface Mentor {
  id: string;
  display_name: string;
  bio: string | null;
  is_verified: boolean;
  is_active: boolean;
  rating_avg: number;
  rating_count: number;
}

export default function AdminMentorsPage() {
  const supabase = useMemo(() => createClientSupabase(), []);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("mentors")
      .select("id, display_name, bio, is_verified, is_active, rating_avg, rating_count")
      .order("display_name");
    setMentors((data as Mentor[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleToggleVerified(mentor: Mentor) {
    const next = !mentor.is_verified;
    setMentors((prev) => prev.map((m) => (m.id === mentor.id ? { ...m, is_verified: next } : m)));
    startTransition(() => toggleMentorVerified(mentor.id, next).catch(() => load()));
  }

  function handleToggleActive(mentor: Mentor) {
    const next = !mentor.is_active;
    setMentors((prev) => prev.map((m) => (m.id === mentor.id ? { ...m, is_active: next } : m)));
    startTransition(() => toggleMentorActive(mentor.id, next).catch(() => load()));
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle emoji="🤝" title="Mentors" />
      <p className="text-xs font-bold text-text-muted">
        Verify mentors to let them answer questions. Deactivate to hide from the Mentors page.
      </p>

      {loading ? (
        <p className="text-sm font-bold text-text-muted">Loading...</p>
      ) : mentors.length === 0 ? (
        <p className="text-sm font-bold text-text-muted">No mentors registered yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {mentors.map((mentor) => (
            <GameCard key={mentor.id} borderColor="border">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-ink">{mentor.display_name}</p>
                  {mentor.rating_count > 0 && (
                    <p className="flex items-center gap-1 text-[10px] font-bold text-yellow">
                      <Star className="h-3 w-3 fill-yellow" /> {mentor.rating_avg.toFixed(1)} ({mentor.rating_count})
                    </p>
                  )}
                </div>
              </div>
              {mentor.bio && <p className="mb-2 text-xs font-bold text-text-muted">{mentor.bio}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleVerified(mentor)}
                  className={`flex-1 rounded-xl border-2 py-1.5 text-[10px] font-black uppercase ${
                    mentor.is_verified ? "border-sky bg-sky/20 text-sky" : "border-border text-text-muted"
                  }`}
                >
                  {mentor.is_verified ? "✓ Verified" : "Verify"}
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleActive(mentor)}
                  className={`flex-1 rounded-xl border-2 py-1.5 text-[10px] font-black uppercase ${
                    mentor.is_active ? "border-green bg-green/20 text-green" : "border-border text-text-muted"
                  }`}
                >
                  {mentor.is_active ? "Active" : "Deactivated"}
                </button>
              </div>
            </GameCard>
          ))}
        </div>
      )}
    </div>
  );
}
