import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const petId = searchParams.get("pet_id");
  const completed = searchParams.get("completed");

  let query = supabase
    .from("reminders")
    .select("*, pets(name, species)")
    .eq("user_id", user.id)
    .order("due_date");

  if (petId) query = query.eq("pet_id", petId);
  if (completed !== null) query = query.eq("is_completed", completed === "true");

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ reminders: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { data, error } = await supabase
    .from("reminders")
    .insert({ ...body, user_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reminder: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, ...updates } = await request.json();
  const { data, error } = await supabase
    .from("reminders")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If marking complete and has repeat, create next occurrence
  if (updates.is_completed && data?.repeat_interval_days) {
    const nextDue = new Date(data.due_date);
    nextDue.setDate(nextDue.getDate() + data.repeat_interval_days);
    await supabase.from("reminders").insert({
      pet_id: data.pet_id,
      user_id: user.id,
      type: data.type,
      title: data.title,
      description: data.description,
      due_date: nextDue.toISOString(),
      repeat_interval_days: data.repeat_interval_days,
      is_completed: false,
    });
  }

  return NextResponse.json({ reminder: data });
}
