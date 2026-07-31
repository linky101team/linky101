"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Lock } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile, useProfileStore } from "@/hooks/useProfile";
import { purchaseItem, equipItem, unequipItem } from "@/lib/actions/shop";
import GameCard from "@/components/ui/GameCard";
import GradientButton from "@/components/ui/GradientButton";
import Confetti from "@/components/Confetti";

interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  coin_cost: number;
  item_data: Record<string, string | boolean | number | string[]>;
}

interface Purchase {
  item_id: string;
  is_equipped: boolean;
}

const CATEGORY_TABS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "frames", label: "Frames" },
  { key: "name_colors", label: "Name Colours" },
  { key: "reactions", label: "Reactions" },
  { key: "banners", label: "Banners" },
  { key: "titles", label: "Titles" },
  { key: "consumables", label: "Streak Shields" },
  { key: "team_themes", label: "Team Themes" },
];

const CATEGORY_ICON: Record<string, string> = {
  frames: "🖼️",
  name_colors: "🔤",
  reactions: "✨",
  banners: "🎏",
  titles: "🏷️",
  consumables: "🛡️",
  team_themes: "🎨",
};

function ItemPreview({ item }: { item: ShopItem }) {
  const data = item.item_data;
  if (item.category === "frames") {
    const color = data.color === "rainbow" ? "#ff6b9d" : (data.color as string) || "#ff6b9d";
    return (
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full border-4 text-xl font-black text-ink"
        style={{
          borderColor: color,
          background: data.color === "rainbow" ? "linear-gradient(135deg,#ff6b9d,#f5c518,#38bdf8,#a78bfa)" : "#0f172a",
          boxShadow: `0 0 14px ${color}`,
        }}
      >
        😀
      </div>
    );
  }
  if (item.category === "name_colors") {
    return (
      <p className="text-lg font-black" style={{ color: (data.color as string) ?? "#fff" }}>
        Your Name
      </p>
    );
  }
  if (item.category === "reactions") {
    return <p className="text-2xl">{(data.emojis as string[])?.join(" ")}</p>;
  }
  if (item.category === "banners") {
    const gradients: Record<string, string> = {
      pink: "linear-gradient(135deg,#ff6b9d,#a78bfa)",
      ocean: "linear-gradient(135deg,#38bdf8,#a78bfa)",
      sunset: "linear-gradient(135deg,#f97316,#ff6b9d)",
    };
    return (
      <div
        className="h-10 w-full rounded-lg"
        style={{ background: gradients[data.gradient as string] ?? gradients.pink }}
      />
    );
  }
  if (item.category === "titles") {
    return (
      <span className="rounded-full border-3 border-yellow px-3 py-1 text-xs font-black uppercase text-yellow">
        {data.text as string}
      </span>
    );
  }
  if (item.category === "consumables") {
    return <p className="text-3xl">🛡️</p>;
  }
  if (item.category === "team_themes") {
    return (
      <p className="text-xs font-black uppercase text-purple">
        {data.theme === "neon" ? "⚡ Neon Theme" : "🌌 Galaxy Theme"}
      </p>
    );
  }
  return null;
}

export default function ShopPage() {
  const { profile } = useProfile();
  const refreshProfile = useProfileStore((s) => s.refreshProfile);
  const supabase = useMemo(() => createClientSupabase(), []);

  const [items, setItems] = useState<ShopItem[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [confirmItem, setConfirmItem] = useState<ShopItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [celebrateItem, setCelebrateItem] = useState<ShopItem | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function load() {
    if (!profile) return;
    const [{ data: itemRows }, { data: purchaseRows }] = await Promise.all([
      supabase.from("shop_items").select("*").eq("is_active", true).order("coin_cost"),
      supabase.from("user_purchases").select("item_id, is_equipped").eq("user_id", profile.id),
    ]);
    setItems((itemRows as ShopItem[]) ?? []);
    setPurchases((purchaseRows as Purchase[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const filteredItems = activeTab === "all" ? items : items.filter((i) => i.category === activeTab);
  const ownedIds = new Set(purchases.map((p) => p.item_id));
  const equippedIds = new Set(purchases.filter((p) => p.is_equipped).map((p) => p.item_id));

  async function handleConfirmPurchase() {
    if (!confirmItem || !profile) return;
    setBusyId(confirmItem.id);
    setErrorMsg(null);
    try {
      const result = await purchaseItem(confirmItem.id);
      if (!result.success) {
        setErrorMsg(result.error ?? "Purchase failed");
        setConfirmItem(null);
        return;
      }
      setCelebrateItem(confirmItem);
      setConfirmItem(null);
      await Promise.all([load(), refreshProfile()]);
      setTimeout(() => setCelebrateItem(null), 1800);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Purchase failed");
      setConfirmItem(null);
    } finally {
      setBusyId(null);
    }
  }

  async function handleEquipToggle(item: ShopItem) {
    setBusyId(item.id);
    setErrorMsg(null);
    try {
      if (equippedIds.has(item.id)) {
        await unequipItem(item.id);
      } else {
        await equipItem(item.id);
      }
      await Promise.all([load(), refreshProfile()]);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  if (!profile || loading) {
    return <p className="text-sm font-bold text-text-muted">Loading shop...</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/profile" className="text-text-muted" aria-label="Back to profile">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="heading-game text-xl">🛍️ LinkCoin Shop</h1>
      </div>

      <GameCard borderColor="yellow" glowColor="yellow" className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wide text-text-muted">Your Balance</span>
        <motion.span
          key={profile.link_coins}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          className="text-xl font-black text-yellow"
        >
          🪙 {profile.link_coins}
        </motion.span>
      </GameCard>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 rounded-full border-3 px-3 py-1.5 text-xs font-black uppercase tracking-wide transition-colors ${
              activeTab === tab.key
                ? "border-pink bg-pink text-white shadow-glow-pink"
                : "border-border text-text-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {errorMsg && (
        <p className="rounded-xl border-3 border-red-500 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400">
          {errorMsg}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {filteredItems.map((item) => {
          const owned = ownedIds.has(item.id);
          const equipped = equippedIds.has(item.id);
          const affordable = profile.link_coins >= item.coin_cost;
          const isConsumableOwned = owned && item.category === "consumables";

          return (
            <GameCard key={item.id} borderColor="border" className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-text-muted">{CATEGORY_ICON[item.category]}</span>
                {equipped && (
                  <span className="flex items-center gap-0.5 rounded-full bg-green px-2 py-0.5 text-[9px] font-black uppercase text-ink">
                    <Check className="h-2.5 w-2.5" strokeWidth={4} /> Equipped
                  </span>
                )}
              </div>

              <div className="flex h-16 items-center justify-center">
                <ItemPreview item={item} />
              </div>

              <p className="text-xs font-black text-ink">{item.name}</p>
              <p className="line-clamp-2 min-h-[2rem] text-[10px] font-bold text-text-muted">{item.description}</p>

              {isConsumableOwned ? (
                <div className="rounded-xl border-3 border-green bg-green/10 py-2 text-center text-[10px] font-black uppercase text-green">
                  Owned
                </div>
              ) : owned ? (
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => handleEquipToggle(item)}
                  className={`rounded-xl border-3 py-2 text-[10px] font-black uppercase transition-transform active:scale-95 disabled:opacity-50 ${
                    equipped ? "border-border text-text-muted" : "border-sky text-sky"
                  }`}
                >
                  {equipped ? "Unequip" : "Equip"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!affordable || busyId === item.id}
                  onClick={() => setConfirmItem(item)}
                  className="flex items-center justify-center gap-1 rounded-xl border-3 border-yellow bg-yellow py-2 text-[10px] font-black uppercase text-ink transition-transform active:scale-95 disabled:border-border disabled:bg-transparent disabled:text-text-muted"
                >
                  {affordable ? (
                    <>🪙 {item.coin_cost}</>
                  ) : (
                    <>
                      <Lock className="h-3 w-3" /> {item.coin_cost - profile.link_coins} more
                    </>
                  )}
                </button>
              )}
            </GameCard>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <p className="py-8 text-center text-sm font-bold text-text-muted">No items in this category yet.</p>
      )}

      <AnimatePresence>
        {confirmItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
            onClick={() => setConfirmItem(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <GameCard borderColor="yellow" glowColor="yellow" className="w-72 text-center">
                <p className="mb-1 text-xs font-black uppercase text-text-muted">Confirm Purchase</p>
                <div className="my-3 flex justify-center">
                  <ItemPreview item={confirmItem} />
                </div>
                <p className="mb-1 text-sm font-black text-ink">{confirmItem.name}</p>
                <p className="mb-4 text-lg font-black text-yellow">🪙 {confirmItem.coin_cost}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmItem(null)}
                    className="flex-1 rounded-xl border-3 border-border py-2 text-xs font-black uppercase text-text-muted"
                  >
                    Cancel
                  </button>
                  <GradientButton
                    variant="yellow"
                    size="sm"
                    className="flex-1"
                    disabled={busyId === confirmItem.id}
                    onClick={handleConfirmPurchase}
                  >
                    {busyId === confirmItem.id ? "..." : "Buy"}
                  </GradientButton>
                </div>
              </GameCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {celebrateItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          >
            <Confetti />
            <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="relative">
              <GameCard borderColor="green" glowColor="green" className="w-64 text-center">
                <p className="text-2xl">🎉</p>
                <p className="mt-1 text-sm font-black text-ink">{celebrateItem.name}</p>
                <p className="text-xs font-bold text-green">Added to your collection!</p>
              </GameCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
