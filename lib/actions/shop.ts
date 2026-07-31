"use server";

import { createServerSupabase } from "@/lib/supabase/server";

interface PurchaseResult {
  success: boolean;
  error?: string;
}

export async function purchaseItem(itemId: string): Promise<PurchaseResult> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: result, error } = await supabase.rpc("purchase_item", {
    p_user_id: user.id,
    p_item_id: itemId,
  });
  if (error) throw new Error(error.message);

  const purchaseResult = result as PurchaseResult;
  if (!purchaseResult?.success) {
    return purchaseResult;
  }

  // Consumables (Streak Shield) apply their effect immediately rather than
  // being "equipped" like a frame or title.
  const { data: item } = await supabase
    .from("shop_items")
    .select("category, item_data")
    .eq("id", itemId)
    .maybeSingle();

  const itemData = item?.item_data as { type?: string; uses?: number } | undefined;
  if (item?.category === "consumables" && itemData?.type === "streak_shield") {
    await supabase.rpc("apply_spin_prize", {
      p_user_id: user.id,
      p_prize_type: "streak_shield",
      p_prize_amount: itemData.uses ?? 1,
    });
    await supabase.from("user_purchases").update({ is_equipped: true }).eq("user_id", user.id).eq("item_id", itemId);
  }

  return purchaseResult;
}

export async function equipItem(itemId: string) {
  const supabase = createServerSupabase();
  const { error } = await supabase.rpc("equip_shop_item", { p_item_id: itemId });
  if (error) throw new Error(error.message);
}

export async function unequipItem(itemId: string) {
  const supabase = createServerSupabase();
  const { error } = await supabase.rpc("unequip_shop_item", { p_item_id: itemId });
  if (error) throw new Error(error.message);
}
