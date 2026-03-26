import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Reminder, Pet } from "@/types";
import { CalendarClient } from "./calendar-client";

export const metadata = { title: "Calendrier & Rappels — Petoo" };

export default async function CalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: reminders }, { data: pets }] = await Promise.all([
    supabase
      .from("reminders")
      .select("*")
      .eq("user_id", user.id)
      .order("due_date", { ascending: true }),
    supabase
      .from("pets")
      .select("id, name, species, avatar_url")
      .eq("owner_id", user.id)
      .eq("is_active", true),
  ]);

  return (
    <CalendarClient
      reminders={(reminders ?? []) as Reminder[]}
      pets={(pets ?? []) as Pet[]}
    />
  );
}
