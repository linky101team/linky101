"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import { togglePostHidden, createLesson } from "@/lib/actions/adminContent";
import SectionTitle from "@/components/ui/SectionTitle";
import GameCard from "@/components/ui/GameCard";
import GradientButton from "@/components/ui/GradientButton";

interface Lesson {
  id: string;
  title: string | null;
  body: string | null;
  category: string;
  is_hidden: boolean;
  author: { first_name: string } | null;
}

export default function AdminLessonsPage() {
  const supabase = useMemo(() => createClientSupabase(), []);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", category: "general" });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("posts")
      .select("id, title, body, category, is_hidden, author:profiles(first_name)")
      .eq("feed_type", "learn")
      .eq("template_type", "lesson")
      .eq("moderation_status", "approved")
      .order("created_at", { ascending: false });
    setLessons((data as unknown as Lesson[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleToggle(lesson: Lesson) {
    const next = !lesson.is_hidden;
    setLessons((prev) => prev.map((l) => (l.id === lesson.id ? { ...l, is_hidden: next } : l)));
    startTransition(() => togglePostHidden(lesson.id, next).catch(() => load()));
  }

  function handleCreate() {
    if (!form.title.trim() || !form.body.trim()) {
      setErrorMsg("Title and content are required.");
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    startTransition(async () => {
      try {
        await createLesson(form);
        setForm({ title: "", body: "", category: "general" });
        setShowForm(false);
        await load();
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to publish lesson");
      } finally {
        setSaving(false);
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <SectionTitle emoji="📚" title="Lessons" />
        <button type="button" onClick={() => setShowForm((v) => !v)} className="text-xs font-black uppercase text-sky">
          {showForm ? "Cancel" : "+ New Lesson"}
        </button>
      </div>

      {showForm && (
        <GameCard borderColor="pink" glowColor="pink" className="flex flex-col gap-2">
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Lesson title"
            className="rounded-xl border-3 border-border bg-navy/60 px-3 py-2 text-sm font-bold text-white placeholder:text-text-muted"
          />
          <input
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            placeholder="Category (e.g. marketing)"
            className="rounded-xl border-3 border-border bg-navy/60 px-3 py-2 text-sm font-bold text-white placeholder:text-text-muted"
          />
          <textarea
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            placeholder="Lesson content"
            rows={4}
            className="rounded-xl border-3 border-border bg-navy/60 px-3 py-2 text-sm font-bold text-white placeholder:text-text-muted"
          />
          {errorMsg && <p className="text-xs font-bold text-orange">{errorMsg}</p>}
          <GradientButton variant="pink" size="sm" disabled={saving} onClick={handleCreate}>
            {saving ? "Publishing..." : "Publish Lesson"}
          </GradientButton>
        </GameCard>
      )}

      {loading ? (
        <p className="text-sm font-bold text-text-muted">Loading...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {lessons.map((lesson) => (
            <GameCard key={lesson.id} borderColor="border" className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-white">{lesson.title}</p>
                <p className="text-[10px] font-bold text-text-muted">
                  {lesson.category} · by {lesson.author?.first_name ?? "Member"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle(lesson)}
                className={`shrink-0 rounded-full border-2 px-2 py-1 text-[9px] font-black uppercase ${
                  lesson.is_hidden ? "border-border text-text-muted" : "border-green bg-green/20 text-green"
                }`}
              >
                {lesson.is_hidden ? "Hidden" : "Visible"}
              </button>
            </GameCard>
          ))}
        </div>
      )}
    </div>
  );
}
