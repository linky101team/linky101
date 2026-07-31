"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import { respondToFeedback, setFeedbackStatus } from "@/lib/actions/adminContent";
import SectionTitle from "@/components/ui/SectionTitle";
import GameCard from "@/components/ui/GameCard";
import GradientButton from "@/components/ui/GradientButton";

interface FeedbackRow {
  id: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  admin_response: string | null;
  created_at: string;
  user: { first_name: string } | null;
}

const STATUS_OPTIONS = ["pending", "in_progress", "resolved"];

export default function AdminFeedbackPage() {
  const supabase = useMemo(() => createClientSupabase(), []);
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [filter, setFilter] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [, startTransition] = useTransition();

  async function load() {
    setLoading(true);
    let query = supabase
      .from("feedback")
      .select("id, category, subject, message, status, admin_response, created_at, user:profiles(first_name)")
      .order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data } = await query;
    setRows((data as unknown as FeedbackRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  function handleRespond(row: FeedbackRow) {
    const response = (drafts[row.id] ?? "").trim();
    if (!response) return;
    startTransition(async () => {
      await respondToFeedback(row.id, response, "resolved");
      await load();
    });
  }

  function handleStatus(row: FeedbackRow, status: string) {
    startTransition(async () => {
      await setFeedbackStatus(row.id, status);
      await load();
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle emoji="💬" title="Feedback Inbox" />

      <div className="flex gap-2">
        {["pending", "in_progress", "resolved", "all"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full border-3 px-3 py-1.5 text-xs font-black uppercase ${
              filter === s ? "border-pink bg-pink text-white shadow-glow-pink" : "border-border text-text-muted"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm font-bold text-text-muted">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm font-bold text-text-muted">Nothing here.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <GameCard key={row.id} borderColor="border">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-xs font-black uppercase text-pink">
                  {row.category.replace("_", " ")} · {row.user?.first_name ?? "Member"}
                </span>
                <span className="text-[10px] font-bold text-text-muted">
                  {new Date(row.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="mb-1 text-sm font-black text-white">{row.subject}</p>
              <p className="mb-3 text-sm font-bold text-text-muted">{row.message}</p>

              {row.admin_response && (
                <div className="mb-3 rounded-xl border-3 border-green bg-green/10 p-2">
                  <p className="text-[10px] font-black uppercase text-green">Your response:</p>
                  <p className="text-xs font-bold text-text-muted">{row.admin_response}</p>
                </div>
              )}

              <div className="flex gap-2">
                <select
                  value={row.status}
                  onChange={(e) => handleStatus(row, e.target.value)}
                  className="rounded-xl border-3 border-border bg-navy/60 px-2 py-1.5 text-xs font-bold text-white"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {!row.admin_response && (
                <div className="mt-2 flex flex-col gap-2">
                  <textarea
                    value={drafts[row.id] ?? ""}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [row.id]: e.target.value }))}
                    rows={2}
                    placeholder="Write a response..."
                    className="w-full rounded-xl border-3 border-border bg-navy/60 px-3 py-2 text-sm font-bold text-white placeholder:text-text-muted focus:border-pink focus:outline-none"
                  />
                  <GradientButton variant="pink" size="sm" onClick={() => handleRespond(row)}>
                    Send Response
                  </GradientButton>
                </div>
              )}
            </GameCard>
          ))}
        </div>
      )}
    </div>
  );
}
