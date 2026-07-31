import Stripe from "stripe";

// A placeholder key lets the module load (and the app build) without real
// Stripe credentials configured; actual API calls will fail until
// STRIPE_SECRET_KEY is set to a real key in .env.local.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  typescript: true,
});

/** Creates a Stripe Checkout session for a subscription and returns its URL. */
export async function createCheckoutSession(
  userId: string,
  priceId: string,
  customerEmail?: string
): Promise<string> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/premium?success=true`,
    cancel_url: `${siteUrl}/premium?canceled=true`,
    client_reference_id: userId,
    customer_email: customerEmail,
    metadata: { userId },
    subscription_data: { metadata: { userId } },
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return session.url;
}
