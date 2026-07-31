"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/stripe";

const PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY ?? "price_monthly_placeholder",
  yearly: process.env.STRIPE_PRICE_ID_YEARLY ?? "price_yearly_placeholder",
};

export async function startCheckout(plan: "monthly" | "yearly"): Promise<string> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const priceId = PRICE_IDS[plan];
  return createCheckoutSession(user.id, priceId, user.email ?? undefined);
}
