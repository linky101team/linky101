"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import { toggleOpportunityActive, createOpportunity } from "@/lib/actions/adminContent";
import SectionTitle from "@/components/ui/SectionTitle";
import GameCard from "@/components/ui/GameCard";
import GradientButton from "@/components/ui/GradientButton";

interface Opportunity {
  id: string;
  title: string;
  category: string;
  deadline: string | null;
  is_active: boolean;
}

const CATEGORIES = ["competition", "grant", "work_experience", "mentorship", "event", "resource"];

export default function AdminOpportunitiesPage() {
  const supabase = useMemo(() => createClientSupabase(), []);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: CATEGORIES[0],
    link: "",
    location: "",
    deadline: "",
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("opportunities")
      .select("id, title, category, deadline, is_active")
      .order("created_at", { ascending: false });
    setOpportunities((data as Opportunity[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleToggle(opp: Opportunity) {
    const next = !opp.is_active;
    setOpportunities((prev) => prev.map((o) => (o.id === opp.id ? { ...o, is_active: next } : o)));
    startTransition(() => toggleOpportunityActive(opp.id, next).catch(() => load()));
  }

  function handleCreate() {
    if (!form.title.trim()) {
      setErrorMsg("Title is required.");
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    startTransition(async () => {
      try {
        await createOpportunity({ ...form, deadline: form.deadline || null });
        setForm({ title: "", description: "", category: CATEGORIES[0], link: "", location: "", deadline: "" });
        setShowForm(false);
        await load();
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to create opportunity");
      } finally {
        setSaving(false);
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <SectionTitle emoji="🎯" title="Opportunities" />
        <button type="button" onClick={() => setShowForm((v) => !v)} className="text-xs font-black uppercase text-sky">
          {showForm ? "Cancel" : "+ New"}
        </button>
      </div>

      {showForm && (
        <GameCard borderColor="pink" glowColor="pink" className="flex flex-col gap-2">
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Title"
            className="rounded-xl border-3 border-border bg-white px-3 py-2 text-sm font-bold text-ink placeholder:text-text-muted"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Description"
            rows={2}
            className="rounded-xl border-3 border-border bg-white px-3 py-2 text-sm font-bold text-ink placeholder:text-text-muted"
          />
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="rounded-xl border-3 border-border bg-white px-3 py-2 text-sm font-bold text-ink"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.replace("_", " ")}
              </option>
            ))}
          </select>
          <input
            value={form.link}
            onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
            placeholder="Link (https://...)"
            className="rounded-xl border-3 border-border bg-white px-3 py-2 text-sm font-bold text-ink placeholder:text-text-muted"
          />
          <div className="flex gap-2">
            <input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="Location"
              className="flex-1 rounded-xl border-3 border-border bg-white px-3 py-2 text-sm font-bold text-ink placeholder:text-text-muted"
            />
            <input
              value={form.deadline}
              onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
              type="date"
              className="rounded-xl border-3 border-border bg-white px-3 py-2 text-sm font-bold text-ink"
            />
          </div>
          {errorMsg && <p className="text-xs font-bold text-orange">{errorMsg}</p>}
          <GradientButton variant="pink" size="sm" disabled={saving} onClick={handleCreate}>
            {saving ? "Creating..." : "Create Opportunity"}
          </GradientButton>
        </GameCard>
      )}

      {loading ? (
        <p className="text-sm font-bold text-text-muted">Loading...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {opportunities.map((opp) => (
            <GameCard key={opp.id} borderColor="border" className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-ink">{opp.title}</p>
                <p className="text-[10px] font-bold text-text-muted">
                  {opp.category.replace("_", " ")}
                  {opp.deadline ? ` · Deadline ${new Date(opp.deadline).toLocaleDateString()}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle(opp)}
                className={`shrink-0 rounded-full border-2 px-2 py-1 text-[9px] font-black uppercase ${
                  opp.is_active ? "border-green bg-green/20 text-green" : "border-border text-text-muted"
                }`}
              >
                {opp.is_active ? "Active" : "Inactive"}
              </button>
            </GameCard>
          ))}
        </div>
      )}
    </div>
  );
}
