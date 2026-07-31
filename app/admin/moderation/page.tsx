"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import {
  approvePost,
  rejectPost,
  actionReport,
  dismissReport,
  issueWarning,
  type WarningType,
} from "@/lib/actions/moderation";
import SectionTitle from "@/components/ui/SectionTitle";
import GameCard from "@/components/ui/GameCard";

type Tab = "pending" | "reports" | "flagged";

interface PendingPost {
  id: string;
  title: string | null;
  body: string | null;
  category: string;
  feed_type: string;
  created_at: string;
  author: { first_name: string } | null;
}

interface Report {
  id: string;
  reported_type: string;
  reported_id: string;
  category: string;
  description: string | null;
  status: string;
  created_at: string;
  reporter: { first_name: string } | null;
}

interface Warning {
  id: string;
  user_id: string;
  warning_type: string;
  reason: string | null;
  issued_at: string;
  expires_at: string | null;
  user: { first_name: string } | null;
}

const URGENT_CATEGORIES = new Set(["bullying", "uncomfortable"]);

function isActive(w: Warning): boolean {
  return !w.expires_at || new Date(w.expires_at).getTime() > Date.now();
}

export default function AdminModerationPage() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [tab, setTab] = useState<Tab>("pending");
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loading, setLoading] = useState(true);
  const [warnTarget, setWarnTarget] = useState<string | null>(null);
  const [warnType, setWarnType] = useState<WarningType>("content_removed");
  const [warnReason, setWarnReason] = useState("");
  const [, startTransition] = useTransition();

  const loadPending = useCallback(async () => {
    const { data } = await supabase
      .from("posts")
      .select("id, title, body, category, feed_type, created_at, author:profiles(first_name)")
      .eq("moderation_status", "pending")
      .order("created_at", { ascending: true });
    setPendingPosts((data ?? []) as unknown as PendingPost[]);
  }, [supabase]);

  const loadReports = useCallback(async () => {
    const { data } = await supabase
      .from("reports")
      .select("id, reported_type, reported_id, category, description, status, created_at, reporter:profiles!reports_reporter_id_fkey(first_name)")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    const rows = (data ?? []) as unknown as Report[];
    rows.sort((a, b) => {
      const urgentA = URGENT_CATEGORIES.has(a.category) ? 0 : 1;
      const urgentB = URGENT_CATEGORIES.has(b.category) ? 0 : 1;
      return urgentA - urgentB;
    });
    setReports(rows);
  }, [supabase]);

  const loadWarnings = useCallback(async () => {
    const { data } = await supabase
      .from("user_warnings")
      .select("id, user_id, warning_type, reason, issued_at, expires_at, user:profiles(first_name)")
      .order("issued_at", { ascending: false })
      .limit(50);
    setWarnings((data ?? []) as unknown as Warning[]);
  }, [supabase]);

  useEffect(() => {
    if (!profile?.is_admin) {
      setLoading(false);
      return;
    }
    async function loadAll() {
      await Promise.all([loadPending(), loadReports(), loadWarnings()]);
      setLoading(false);
    }
    loadAll();
  }, [profile, loadPending, loadReports, loadWarnings]);

  function handleApprove(postId: string) {
    setPendingPosts((prev) => prev.filter((p) => p.id !== postId));
    startTransition(() => approvePost(postId).catch(() => loadPending()));
  }

  function handleReject(postId: string) {
    setPendingPosts((prev) => prev.filter((p) => p.id !== postId));
    startTransition(() => rejectPost(postId).catch(() => loadPending()));
  }

  function handleAction(reportId: string) {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    startTransition(() => actionReport(reportId).then(loadWarnings).catch(() => loadReports()));
  }

  function handleDismiss(reportId: string) {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    startTransition(() => dismissReport(reportId).catch(() => loadReports()));
  }

  function handleIssueWarning() {
    if (!warnTarget || !warnReason.trim()) return;
    const durationHours = warnType === "posting_restriction" ? 24 : warnType === "suspension" ? 168 : null;
    startTransition(async () => {
      await issueWarning(warnTarget, warnType, warnReason.trim(), durationHours);
      setWarnTarget(null);
      setWarnReason("");
      await loadWarnings();
    });
  }

  if (!profile) return <p className="text-sm font-bold text-text-muted">Loading...</p>;

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle emoji="🛡️" title="Moderation" />

      <div className="flex gap-2 rounded-xl border-3 border-border bg-card p-1">
        {(["pending", "reports", "flagged"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-[10px] font-black uppercase ${
              tab === t ? "bg-gradient-pink-purple text-white" : "text-text-muted"
            }`}
          >
            {t === "pending" ? `Pending (${pendingPosts.length})` : t === "reports" ? `Reports (${reports.length})` : "Flagged"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm font-bold text-text-muted">Loading...</p>
      ) : tab === "pending" ? (
        pendingPosts.length === 0 ? (
          <p className="text-sm font-bold text-text-muted">Nothing pending — nice and clear!</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pendingPosts.map((p) => (
              <GameCard key={p.id} borderColor="sky">
                <div className="mb-2 flex items-center justify-between text-xs font-black uppercase text-text-muted">
                  <span>
                    {p.author?.first_name ?? "Member"} · {p.feed_type} · {p.category}
                  </span>
                </div>
                {p.title && <p className="mb-1 text-sm font-black text-white">{p.title}</p>}
                {p.body && <p className="mb-3 text-sm font-bold text-text-muted">{p.body}</p>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleReject(p.id)}
                    className="flex-1 rounded-xl border-3 border-orange py-2 text-xs font-black uppercase text-orange"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(p.id)}
                    className="flex-1 rounded-xl border-3 border-green bg-green/10 py-2 text-xs font-black uppercase text-green"
                  >
                    Approve
                  </button>
                </div>
              </GameCard>
            ))}
          </div>
        )
      ) : tab === "reports" ? (
        reports.length === 0 ? (
          <p className="text-sm font-bold text-text-muted">No open reports.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {reports.map((r) => {
              const urgent = URGENT_CATEGORIES.has(r.category);
              return (
                <GameCard key={r.id} borderColor={urgent ? "orange" : "border"}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-white">
                      {urgent && "🚨 "}
                      {r.category.replace("_", " ")} · {r.reported_type}
                    </span>
                    <span className="text-[10px] font-bold text-text-muted">
                      by {r.reporter?.first_name ?? "Member"}
                    </span>
                  </div>
                  {r.description && (
                    <p className="mb-3 text-sm font-bold text-text-muted">{r.description}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleDismiss(r.id)}
                      className="flex-1 rounded-xl border-3 border-border py-2 text-xs font-black uppercase text-text-muted"
                    >
                      Dismiss
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(r.id)}
                      className="flex-1 rounded-xl border-3 border-orange bg-orange/10 py-2 text-xs font-black uppercase text-orange"
                    >
                      Action
                    </button>
                  </div>
                </GameCard>
              );
            })}
          </div>
        )
      ) : (
        <div className="flex flex-col gap-3">
          {warnings.length === 0 ? (
            <p className="text-sm font-bold text-text-muted">No warnings issued.</p>
          ) : (
            warnings.map((w) => (
              <GameCard key={w.id} borderColor={isActive(w) ? "orange" : "border"}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-black text-white">{w.user?.first_name ?? "Member"}</span>
                  <span className="text-[10px] font-black uppercase text-orange">
                    {w.warning_type.replace("_", " ")}
                  </span>
                </div>
                {w.reason && <p className="mb-1 text-xs font-bold text-text-muted">{w.reason}</p>}
                <p className="text-[10px] font-bold text-text-muted">
                  Issued {new Date(w.issued_at).toLocaleDateString()}
                  {w.expires_at &&
                    ` · ${isActive(w) ? "expires" : "expired"} ${new Date(w.expires_at).toLocaleDateString()}`}
                </p>
                <button
                  type="button"
                  onClick={() => setWarnTarget(w.user_id)}
                  className="mt-2 text-[10px] font-black uppercase text-sky"
                >
                  + Issue another warning
                </button>
              </GameCard>
            ))
          )}
        </div>
      )}

      {warnTarget && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-navy/80 px-6">
          <div className="w-full max-w-[360px] rounded-[18px] border-3 border-orange bg-card p-5">
            <p className="mb-3 font-black uppercase text-white">Issue Warning</p>
            <select
              value={warnType}
              onChange={(e) => setWarnType(e.target.value as WarningType)}
              className="mb-2 w-full rounded-xl border-3 border-border bg-navy/60 px-3 py-2 text-sm font-bold text-white"
            >
              <option value="content_removed">Content Removed</option>
              <option value="posting_restriction">Posting Restriction (24h)</option>
              <option value="suspension">Suspension (7d)</option>
              <option value="ban">Ban</option>
            </select>
            <textarea
              value={warnReason}
              onChange={(e) => setWarnReason(e.target.value)}
              placeholder="Reason"
              rows={3}
              className="mb-3 w-full rounded-xl border-3 border-border bg-navy/60 px-3 py-2 text-sm font-bold text-white placeholder:text-text-muted"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setWarnTarget(null)}
                className="flex-1 rounded-xl border-3 border-border py-2 text-xs font-black uppercase text-text-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleIssueWarning}
                disabled={!warnReason.trim()}
                className="flex-1 rounded-xl border-3 border-orange bg-orange py-2 text-xs font-black uppercase text-navy disabled:opacity-40"
              >
                Issue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
