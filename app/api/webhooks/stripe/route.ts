import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";

// A plain anon-key client is enough here — apply_premium_status (009) is a
// SECURITY DEFINER RPC, so it doesn't need a service-role key or an
// authenticated session to write is_premium/premium_until.
function supabaseForWebhook() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

// Stripe moved current_period_end from the subscription root to each
// subscription item (a subscription can have items with different billing
// periods) — read it off the first item, falling back to now()+30d if a
// subscription somehow has no items.
function periodEndISO(subscription: Stripe.Subscription): string {
  const periodEnd = subscription.items.data[0]?.current_period_end;
  const fallback = Math.floor(Date.now() / 1000) + 30 * 86_400;
  return new Date((periodEnd ?? fallback) * 1000).toISOString();
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = supabaseForWebhook();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id ?? session.metadata?.userId;
      if (userId) {
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
        let premiumUntil: string | null = null;
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          premiumUntil = periodEndISO(subscription);
        }
        await supabase.rpc("apply_premium_status", {
          p_user_id: userId,
          p_is_premium: true,
          p_premium_until: premiumUntil,
          p_stripe_customer_id: typeof session.customer === "string" ? session.customer : (session.customer?.id ?? null),
          p_stripe_subscription_id: subscriptionId ?? null,
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      if (userId) {
        const isActive = subscription.status === "active" || subscription.status === "trialing";
        await supabase.rpc("apply_premium_status", {
          p_user_id: userId,
          p_is_premium: isActive,
          p_premium_until: isActive ? periodEndISO(subscription) : null,
          p_stripe_subscription_id: subscription.id,
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      if (userId) {
        await supabase.rpc("apply_premium_status", {
          p_user_id: userId,
          p_is_premium: false,
          p_premium_until: null,
          p_stripe_subscription_id: subscription.id,
        });
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
