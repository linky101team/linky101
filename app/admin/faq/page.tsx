"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import { toggleFaqPublished, createFaqItem } from "@/lib/actions/adminContent";
import SectionTitle from "@/components/ui/SectionTitle";
import GameCard from "@/components/ui/GameCard";
import GradientButton from "@/components/ui/GradientButton";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_index: number;
  is_published: boolean;
}

export default function AdminFaqPage() {
  const supabase = useMemo(() => createClientSupabase(), []);
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ question: "", answer: "", category: "general", order_index: "0" });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("faq_items")
      .select("id, question, answer, category, order_index, is_published")
      .order("category")
      .order("order_index");
    setItems((data as FaqItem[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleToggle(item: FaqItem) {
    const next = !item.is_published;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_published: next } : i)));
    startTransition(() => toggleFaqPublished(item.id, next).catch(() => load()));
  }

  function handleCreate() {
    if (!form.question.trim() || !form.answer.trim()) {
      setErrorMsg("Question and answer are required.");
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    startTransition(async () => {
      try {
        await createFaqItem({
          question: form.question.trim(),
          answer: form.answer.trim(),
          category: form.category.trim() || "general",
          order_index: Number(form.order_index) || 0,
        });
        setForm({ question: "", answer: "", category: "general", order_index: "0" });
        setShowForm(false);
        await load();
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to create FAQ item");
      } finally {
        setSaving(false);
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <SectionTitle emoji="❓" title="FAQ" />
        <button type="button" onClick={() => setShowForm((v) => !v)} className="text-xs font-black uppercase text-sky">
          {showForm ? "Cancel" : "+ New"}
        </button>
      </div>

      {showForm && (
        <GameCard borderColor="pink" glowColor="pink" className="flex flex-col gap-2">
          <input
            value={form.question}
            onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
            placeholder="Question"
            className="rounded-xl border-3 border-border bg-white px-3 py-2 text-sm font-bold text-ink placeholder:text-text-muted"
          />
          <textarea
            value={form.answer}
            onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
            placeholder="Answer"
            rows={3}
            className="rounded-xl border-3 border-border bg-white px-3 py-2 text-sm font-bold text-ink placeholder:text-text-muted"
          />
          <div className="flex gap-2">
            <input
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="Category"
              className="flex-1 rounded-xl border-3 border-border bg-white px-3 py-2 text-sm font-bold text-ink placeholder:text-text-muted"
            />
            <input
              value={form.order_index}
              onChange={(e) => setForm((f) => ({ ...f, order_index: e.target.value }))}
              type="number"
              placeholder="Order"
              className="w-20 rounded-xl border-3 border-border bg-white px-3 py-2 text-sm font-bold text-ink placeholder:text-text-muted"
            />
          </div>
          {errorMsg && <p className="text-xs font-bold text-orange">{errorMsg}</p>}
          <GradientButton variant="pink" size="sm" disabled={saving} onClick={handleCreate}>
            {saving ? "Publishing..." : "Publish FAQ Item"}
          </GradientButton>
        </GameCard>
      )}

      {loading ? (
        <p className="text-sm font-bold text-text-muted">Loading...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <GameCard key={item.id} borderColor="border" className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-ink">{item.question}</p>
                <p className="text-[10px] font-bold text-text-muted">{item.category}</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle(item)}
                className={`shrink-0 rounded-full border-2 px-2 py-1 text-[9px] font-black uppercase ${
                  item.is_published ? "border-green bg-green/20 text-green" : "border-border text-text-muted"
                }`}
              >
                {item.is_published ? "Published" : "Draft"}
              </button>
            </GameCard>
          ))}
        </div>
      )}
    </div>
  );
}
