import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("pets")
    .select(`
      *,
      reminders (id, type, title, due_date, is_completed),
      health_records (id, type, title, date, next_due_date),
      weight_logs (id, weight_kg, recorded_at)
    `)
    .eq("owner_id", user.id)
    .eq("is_active", true)
    .order("created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pets: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check pet limit by subscription
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  const { count } = await supabase
    .from("pets")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user.id)
    .eq("is_active", true);

  const limit = profile?.subscription_tier === "premium" ? 5 : profile?.subscription_tier === "pro" ? 999 : 1;
  if ((count ?? 0) >= limit) {
    return NextResponse.json({
      error: `Limite atteinte (${limit} animal${limit > 1 ? "aux" : ""} max pour votre abonnement). Passez à Premium pour plus.`
    }, { status: 403 });
  }

  const body = await request.json();
  const { data, error } = await supabase
    .from("pets")
    .insert({ ...body, owner_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pet: data }, { status: 201 });
}
