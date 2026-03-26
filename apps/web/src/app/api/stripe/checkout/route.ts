import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PLANS, createOrRetrieveCustomer } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tier, annual } = await request.json();

  const plan = PLANS[tier as keyof typeof PLANS];
  if (!plan || plan.price_monthly === 0) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, stripe_customer_id")
    .eq("id", user.id)
    .single();

  const customer = await createOrRetrieveCustomer(
    user.id,
    profile?.email ?? user.email!,
    profile?.full_name ?? ""
  );

  const priceId = annual ? plan.stripe_price_yearly : plan.stripe_price_monthly;

  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      metadata: { supabase_user_id: user.id, tier },
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=subscription&success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=subscription&cancelled=true`,
    metadata: { supabase_user_id: user.id, tier },
    allow_promotion_codes: true,
    billing_address_collection: "required",
    locale: "fr",
  });

  return NextResponse.json({ url: session.url });
}
