"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import SectionTitle from "@/components/ui/SectionTitle";
import GradientButton from "@/components/ui/GradientButton";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_index: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  getting_started: "Getting Started",
  streaks: "Streaks",
  teams: "Teams",
  features: "Features",
  account: "Account",
  general: "General",
};

export default function HelpPage() {
  const supabase = useMemo(() => createClientSupabase(), []);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("faq_items")
      .select("id, question, answer, category, order_index")
      .eq("is_published", true)
      .order("category")
      .order("order_index")
      .then(({ data }) => {
        setFaqs((data as FaqItem[]) ?? []);
        setLoading(false);
      });
  }, [supabase]);

  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  const filtered = faqs.filter((f) => {
    const matchesCategory = activeCategory === "all" || f.category === activeCategory;
    const matchesSearch =
      !search.trim() ||
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-5 pb-8">
      <SectionTitle emoji="❓" title="Help & FAQ" />

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for help..."
          className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#039BE5] focus:outline-none"
        />
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
            activeCategory === "all" ? "bg-[#1A1A2E] text-white shadow-sm" : "border border-gray-200 bg-white text-gray-500"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
              activeCategory === cat ? "bg-[#1A1A2E] text-white shadow-sm" : "border border-gray-200 bg-white text-gray-500"
            }`}
          >
            {CATEGORY_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm font-bold text-text-muted">Loading...</p>}

      <div className="flex flex-col gap-2">
        {filtered.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div key={faq.id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="flex w-full items-center justify-between gap-3 p-3 text-left"
              >
                <span className="text-sm font-bold text-gray-900">{faq.question}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <p className="border-t border-gray-100 bg-gray-50 p-3 text-sm leading-relaxed text-gray-600">
                  {faq.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {!loading && filtered.length === 0 && (
        <p className="py-8 text-center text-sm font-bold text-text-muted">
          No results — try a different search or ask us directly below.
        </p>
      )}

      <div className="mt-2 rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm">
        <p className="mb-2 text-sm font-bold text-text-muted">Still need help?</p>
        <Link href="/feedback">
          <GradientButton variant="sky" className="w-full">
            💬 Contact Us
          </GradientButton>
        </Link>
      </div>
    </div>
  );
}
