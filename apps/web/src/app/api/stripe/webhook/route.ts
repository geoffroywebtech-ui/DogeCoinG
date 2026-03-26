import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = await createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.CheckoutSession;
      const userId = session.metadata?.supabase_user_id;
      const tier = session.metadata?.tier;
      if (userId && tier) {
        await supabase.from("profiles").update({
          subscription_tier: tier,
          subscription_status: "active",
          stripe_subscription_id: session.subscription as string,
        }).eq("id", userId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (profile) {
        const status = subscription.status === "active" ? "active" :
                       subscription.status === "past_due" ? "past_due" : "cancelled";

        // Determine tier from price metadata
        const priceId = subscription.items.data[0]?.price.id;
        let tier = "free";
        if (priceId === process.env.STRIPE_PRICE_PREMIUM_MONTHLY || priceId === process.env.STRIPE_PRICE_PREMIUM_YEARLY) {
          tier = "premium";
        } else if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY || priceId === process.env.STRIPE_PRICE_PRO_YEARLY) {
          tier = "pro";
        }

        await supabase.from("profiles").update({
          subscription_status: status,
          subscription_tier: status === "active" ? tier : "free",
        }).eq("id", profile.id);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      await supabase.from("profiles").update({
        subscription_tier: "free",
        subscription_status: "cancelled",
        stripe_subscription_id: null,
      }).eq("stripe_customer_id", customerId);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      await supabase.from("profiles").update({
        subscription_status: "past_due",
      }).eq("stripe_customer_id", customerId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
