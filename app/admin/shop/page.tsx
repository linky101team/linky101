"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import { toggleShopItemActive } from "@/lib/actions/adminContent";
import SectionTitle from "@/components/ui/SectionTitle";
import GameCard from "@/components/ui/GameCard";

interface ShopItem {
  id: string;
  name: string;
  category: string;
  coin_cost: number;
  is_active: boolean;
}

export default function AdminShopPage() {
  const supabase = useMemo(() => createClientSupabase(), []);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [purchaseCounts, setPurchaseCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    async function load() {
      const [{ data: itemRows }, { data: purchases }] = await Promise.all([
        supabase.from("shop_items").select("id, name, category, coin_cost, is_active").order("category"),
        supabase.from("user_purchases").select("item_id"),
      ]);
      setItems((itemRows as ShopItem[]) ?? []);
      const counts: Record<string, number> = {};
      for (const p of purchases ?? []) counts[p.item_id] = (counts[p.item_id] ?? 0) + 1;
      setPurchaseCounts(counts);
      setLoading(false);
    }
    load();
  }, [supabase]);

  function handleToggle(item: ShopItem) {
    const next = !item.is_active;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_active: next } : i)));
    startTransition(() => toggleShopItemActive(item.id, next));
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle emoji="🛍️" title="Shop" />
      <p className="text-xs font-bold text-text-muted">Toggle items off to pull them from sale without deleting them.</p>

      {loading ? (
        <p className="text-sm font-bold text-text-muted">Loading...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <GameCard key={item.id} borderColor="border" className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-white">{item.name}</p>
                <p className="text-[10px] font-bold text-text-muted">
                  {item.category.replace("_", " ")} · 🪙{item.coin_cost} · {purchaseCounts[item.id] ?? 0} owned
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle(item)}
                className={`shrink-0 rounded-full border-2 px-2 py-1 text-[9px] font-black uppercase ${
                  item.is_active ? "border-green bg-green/20 text-green" : "border-border text-text-muted"
                }`}
              >
                {item.is_active ? "On Sale" : "Off Sale"}
              </button>
            </GameCard>
          ))}
        </div>
      )}
    </div>
  );
}
