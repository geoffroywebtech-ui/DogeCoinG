import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PLATFORM_FEE_RATE } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { provider_id, service_id, pet_id, scheduled_at, notes } = body;

  // Fetch service details
  const { data: service } = await supabase
    .from("provider_services")
    .select("price, duration_minutes, name")
    .eq("id", service_id)
    .single();

  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

  // Fetch provider details
  const { data: provider } = await supabase
    .from("service_providers")
    .select("groomer_type, stripe_account_id")
    .eq("id", provider_id)
    .single();

  if (!provider) return NextResponse.json({ error: "Provider not found" }, { status: 404 });

  const platformFee = service.price * PLATFORM_FEE_RATE;
  const depositAmount = service.price * 0.3; // 30% deposit

  // Create booking
  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      client_id: user.id,
      provider_id,
      pet_id,
      service_id,
      scheduled_at,
      duration_minutes: service.duration_minutes,
      price_total: service.price,
      deposit_amount: depositAmount,
      travel_fee: 0,
      platform_fee: platformFee,
      notes,
      status: "pending",
      payment_status: "pending",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Create Stripe Payment Intent for deposit
  if (provider.stripe_account_id) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(depositAmount * 100),
      currency: "eur",
      customer: undefined,
      metadata: { booking_id: booking.id, type: "deposit" },
      transfer_data: {
        destination: provider.stripe_account_id,
      },
      application_fee_amount: Math.round(platformFee * 100),
    });

    await supabase
      .from("bookings")
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq("id", booking.id);

    return NextResponse.json({ booking, client_secret: paymentIntent.client_secret });
  }

  return NextResponse.json({ booking });
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let query = supabase
    .from("bookings")
    .select(`
      *,
      service_providers (id, business_name, city, rating_avg),
      pets (id, name, species),
      provider_services (id, name, price, duration_minutes)
    `)
    .eq("client_id", user.id)
    .order("scheduled_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ bookings: data });
}
