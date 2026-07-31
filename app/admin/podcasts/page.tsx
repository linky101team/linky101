"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import { togglePodcastPublished, createPodcast } from "@/lib/actions/adminContent";
import { QUIZ_CATEGORIES } from "@/lib/quizCategories";
import SectionTitle from "@/components/ui/SectionTitle";
import GameCard from "@/components/ui/GameCard";
import GradientButton from "@/components/ui/GradientButton";

interface Podcast {
  id: string;
  title: string;
  description: string | null;
  episode_number: number | null;
  category: string;
  duration_seconds: number | null;
  is_published: boolean;
}

const CATEGORY_KEYS = Object.keys(QUIZ_CATEGORIES);

export default function AdminPodcastsPage() {
  const supabase = useMemo(() => createClientSupabase(), []);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    episode_number: "",
    audio_url: "",
    duration_seconds: "",
    category: CATEGORY_KEYS[0],
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("podcasts")
      .select("id, title, description, episode_number, category, duration_seconds, is_published")
      .order("episode_number");
    setPodcasts((data as Podcast[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleToggle(podcast: Podcast) {
    const next = !podcast.is_published;
    setPodcasts((prev) => prev.map((p) => (p.id === podcast.id ? { ...p, is_published: next } : p)));
    startTransition(() => togglePodcastPublished(podcast.id, next).catch(() => load()));
  }

  function handleCreate() {
    if (!form.title.trim() || !form.audio_url.trim()) {
      setErrorMsg("Title and audio URL are required.");
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    startTransition(async () => {
      try {
        await createPodcast({
          title: form.title.trim(),
          description: form.description.trim(),
          episode_number: form.episode_number ? Number(form.episode_number) : null,
          audio_url: form.audio_url.trim(),
          duration_seconds: form.duration_seconds ? Number(form.duration_seconds) : null,
          category: form.category,
        });
        setForm({ title: "", description: "", episode_number: "", audio_url: "", duration_seconds: "", category: CATEGORY_KEYS[0] });
        setShowForm(false);
        await load();
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to create episode");
      } finally {
        setSaving(false);
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <SectionTitle emoji="🎧" title="Podcasts" />
        <button type="button" onClick={() => setShowForm((v) => !v)} className="text-xs font-black uppercase text-sky">
          {showForm ? "Cancel" : "+ New Episode"}
        </button>
      </div>

      {showForm && (
        <GameCard borderColor="pink" glowColor="pink" className="flex flex-col gap-2">
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Episode title"
            className="rounded-xl border-3 border-border bg-white px-3 py-2 text-sm font-bold text-ink placeholder:text-text-muted"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Description"
            rows={2}
            className="rounded-xl border-3 border-border bg-white px-3 py-2 text-sm font-bold text-ink placeholder:text-text-muted"
          />
          <input
            value={form.audio_url}
            onChange={(e) => setForm((f) => ({ ...f, audio_url: e.target.value }))}
            placeholder="Audio URL (https://...)"
            className="rounded-xl border-3 border-border bg-white px-3 py-2 text-sm font-bold text-ink placeholder:text-text-muted"
          />
          <div className="flex gap-2">
            <input
              value={form.episode_number}
              onChange={(e) => setForm((f) => ({ ...f, episode_number: e.target.value }))}
              placeholder="Ep #"
              type="number"
              className="w-20 rounded-xl border-3 border-border bg-white px-3 py-2 text-sm font-bold text-ink placeholder:text-text-muted"
            />
            <input
              value={form.duration_seconds}
              onChange={(e) => setForm((f) => ({ ...f, duration_seconds: e.target.value }))}
              placeholder="Duration (s)"
              type="number"
              className="flex-1 rounded-xl border-3 border-border bg-white px-3 py-2 text-sm font-bold text-ink placeholder:text-text-muted"
            />
          </div>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="rounded-xl border-3 border-border bg-white px-3 py-2 text-sm font-bold text-ink"
          >
            {CATEGORY_KEYS.map((key) => (
              <option key={key} value={key}>
                {QUIZ_CATEGORIES[key].label}
              </option>
            ))}
          </select>
          {errorMsg && <p className="text-xs font-bold text-orange">{errorMsg}</p>}
          <GradientButton variant="pink" size="sm" disabled={saving} onClick={handleCreate}>
            {saving ? "Publishing..." : "Publish Episode"}
          </GradientButton>
        </GameCard>
      )}

      {loading ? (
        <p className="text-sm font-bold text-text-muted">Loading...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {podcasts.map((p) => (
            <GameCard key={p.id} borderColor="border" className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-ink">
                  {p.episode_number ? `Ep. ${p.episode_number} · ` : ""}
                  {p.title}
                </p>
                <p className="text-[10px] font-bold text-text-muted">{QUIZ_CATEGORIES[p.category]?.label ?? p.category}</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle(p)}
                className={`shrink-0 rounded-full border-2 px-2 py-1 text-[9px] font-black uppercase ${
                  p.is_published ? "border-green bg-green/20 text-green" : "border-border text-text-muted"
                }`}
              >
                {p.is_published ? "Published" : "Draft"}
              </button>
            </GameCard>
          ))}
        </div>
      )}
    </div>
  );
}
