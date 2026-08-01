"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import { createPodcast } from "@/lib/actions/adminContent";
import SectionTitle from "@/components/ui/SectionTitle";
import GameCard from "@/components/ui/GameCard";
import GradientButton from "@/components/ui/GradientButton";

interface Podcast {
  id: string;
  title: string;
  description: string | null;
  episode_number: number | null;
  duration_minutes: number | null;
  guest_name: string | null;
}

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
    duration_minutes: "",
    guest_name: "",
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("podcasts")
      .select("id, title, description, episode_number, duration_minutes, guest_name")
      .order("episode_number");
    setPodcasts((data as Podcast[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
          guest_name: form.guest_name.trim() || null,
        });
        setForm({ title: "", description: "", episode_number: "", audio_url: "", duration_minutes: "", guest_name: "" });
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
              value={form.duration_minutes}
              onChange={(e) => setForm((f) => ({ ...f, duration_minutes: e.target.value }))}
              placeholder="Duration (min)"
              type="number"
              className="flex-1 rounded-xl border-3 border-border bg-white px-3 py-2 text-sm font-bold text-ink placeholder:text-text-muted"
            />
          </div>
          <input
            value={form.guest_name}
            onChange={(e) => setForm((f) => ({ ...f, guest_name: e.target.value }))}
            placeholder="Guest name (optional)"
            className="rounded-xl border-3 border-border bg-white px-3 py-2 text-sm font-bold text-ink placeholder:text-text-muted"
          />
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
                <p className="text-[10px] font-bold text-text-muted">{p.guest_name ? `with ${p.guest_name}` : ""}</p>
              </div>
            </GameCard>
          ))}
        </div>
      )}
    </div>
  );
}
