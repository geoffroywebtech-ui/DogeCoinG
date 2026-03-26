import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  calculateAge,
  formatDate,
  formatRelative,
  getSpeciesEmoji,
  getSpeciesLabel,
  getReminderTypeColor,
  getReminderTypeLabel,
  cn,
} from "@/lib/utils";
import {
  ArrowLeft,
  Edit2,
  Heart,
  Scale,
  Stethoscope,
  Bell,
  Camera,
  Plus,
  CalendarDays,
  Syringe,
  Pill,
  ClipboardList,
  Scissors,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import type { Pet, HealthRecord, WeightLog, Reminder, PetMedia } from "@/types";
import { PetWeightChart } from "./weight-chart";
import { PetTabsClient } from "./tabs-client";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: pet } = await supabase
    .from("pets")
    .select("name, species")
    .eq("id", params.id)
    .single();
  return {
    title: pet ? `${pet.name} — Petoo` : "Animal — Petoo",
  };
}

const healthTypeConfig: Record<
  string,
  { emoji: string; color: string; bg: string }
> = {
  vaccine: { emoji: "💉", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  deworming: { emoji: "🪱", color: "text-green-700", bg: "bg-green-50 border-green-200" },
  checkup: { emoji: "🩺", color: "text-teal-700", bg: "bg-teal-50 border-teal-200" },
  surgery: { emoji: "🔪", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  medication: { emoji: "💊", color: "text-petoo-700", bg: "bg-petoo-50 border-petoo-200" },
  other: { emoji: "📋", color: "text-gray-700", bg: "bg-gray-50 border-gray-200" },
};

export default async function PetDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch pet
  const { data: pet, error: petError } = await supabase
    .from("pets")
    .select("*")
    .eq("id", params.id)
    .eq("owner_id", user.id)
    .single();

  if (petError || !pet) notFound();

  // Parallel fetches
  const [
    { data: healthRecords },
    { data: weightLogs },
    { data: reminders },
    { data: media },
  ] = await Promise.all([
    supabase
      .from("health_records")
      .select("*")
      .eq("pet_id", params.id)
      .order("date", { ascending: false }),
    supabase
      .from("weight_logs")
      .select("*")
      .eq("pet_id", params.id)
      .order("recorded_at", { ascending: true }),
    supabase
      .from("reminders")
      .select("*")
      .eq("pet_id", params.id)
      .order("due_date", { ascending: true }),
    supabase
      .from("pet_media")
      .select("*")
      .eq("pet_id", params.id)
      .order("taken_at", { ascending: false })
      .limit(12),
  ]);

  const speciesGradient: Record<string, string> = {
    dog: "from-sunshine-200 via-petoo-100 to-teal-50",
    cat: "from-lavender-200 via-lavender-100 to-teal-50",
    rabbit: "from-mint-200 via-mint-100 to-teal-50",
  };

  const upcomingReminders = (reminders ?? []).filter((r: Reminder) => !r.is_completed);
  const completedReminders = (reminders ?? []).filter((r: Reminder) => r.is_completed);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Back + Edit row */}
      <div className="flex items-center justify-between">
        <Link
          href="/pets"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Mes animaux
        </Link>
        <Link
          href={`/pets/${params.id}/edit`}
          className="inline-flex items-center gap-2 text-sm font-medium text-petoo-500 hover:text-petoo-600 bg-petoo-50 hover:bg-petoo-100 px-3 py-1.5 rounded-xl transition-all"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Modifier
        </Link>
      </div>

      {/* Pet hero card */}
      <div
        className={cn(
          "rounded-3xl overflow-hidden border border-white/60 shadow-lg",
          "bg-gradient-to-br",
          speciesGradient[pet.species] ?? "from-gray-100 to-gray-50"
        )}
      >
        <div className="relative h-40 sm:h-52 flex items-end pb-0">
          {/* Decorative blobs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute top-4 left-1/3 w-24 h-24 rounded-full bg-white/20 blur-xl" />
          </div>
          {/* Large species emoji */}
          <div className="absolute top-6 right-8 text-7xl opacity-30 select-none">
            {getSpeciesEmoji(pet.species)}
          </div>
        </div>

        {/* Profile section */}
        <div className="bg-white px-6 pt-0 pb-6 relative">
          {/* Avatar overlapping */}
          <div className="flex items-end gap-5 -mt-12 mb-4">
            <div className="relative flex-shrink-0">
              {pet.avatar_url ? (
                <img
                  src={pet.avatar_url}
                  alt={pet.name}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg bg-gradient-to-br from-petoo-50 to-teal-50 flex items-center justify-center text-4xl">
                  {getSpeciesEmoji(pet.species)}
                </div>
              )}
            </div>
            <div className="pb-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {pet.name}
                </h1>
                <span className="text-xl">
                  {pet.gender === "male" ? "♂️" : "♀️"}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {getSpeciesLabel(pet.species)}
                {pet.breed && ` · ${pet.breed}`}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-3">
            {pet.birth_date && (
              <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-100 text-teal-700 text-sm font-medium px-3 py-1.5 rounded-full">
                <span>🎂</span>
                <span>{calculateAge(pet.birth_date)}</span>
              </div>
            )}
            {pet.weight_kg && (
              <div className="flex items-center gap-1.5 bg-lavender-50 border border-lavender-100 text-lavender-700 text-sm font-medium px-3 py-1.5 rounded-full">
                <Scale className="w-3.5 h-3.5" />
                <span>{pet.weight_kg} kg</span>
              </div>
            )}
            {pet.birth_date && (
              <div className="flex items-center gap-1.5 bg-sunshine-100 border border-sunshine-200 text-amber-700 text-sm font-medium px-3 py-1.5 rounded-full">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Né(e) le {formatDate(pet.birth_date)}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-coral-100 border border-coral-200 text-coral-500 text-sm font-medium px-3 py-1.5 rounded-full">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>
                {(healthRecords ?? []).length} soin
                {(healthRecords ?? []).length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {pet.bio && (
            <p className="mt-4 text-sm text-gray-600 leading-relaxed max-w-2xl border-t border-gray-100 pt-4">
              {pet.bio}
            </p>
          )}
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Soins",
            value: (healthRecords ?? []).length,
            emoji: "🩺",
            bg: "bg-teal-50 border-teal-100",
            text: "text-teal-700",
          },
          {
            label: "Rappels actifs",
            value: upcomingReminders.length,
            emoji: "🔔",
            bg: "bg-petoo-50 border-petoo-100",
            text: "text-petoo-600",
          },
          {
            label: "Pesées",
            value: (weightLogs ?? []).length,
            emoji: "⚖️",
            bg: "bg-lavender-50 border-lavender-100",
            text: "text-lavender-600",
          },
          {
            label: "Photos",
            value: (media ?? []).length,
            emoji: "📸",
            bg: "bg-sunshine-100 border-sunshine-200",
            text: "text-amber-700",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "rounded-2xl border p-4 flex flex-col items-center text-center",
              stat.bg
            )}
          >
            <span className="text-2xl mb-1">{stat.emoji}</span>
            <span className={cn("text-2xl font-bold", stat.text)}>
              {stat.value}
            </span>
            <span className="text-xs text-gray-500 mt-0.5">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs section */}
      <PetTabsClient
        pet={pet as Pet}
        healthRecords={(healthRecords ?? []) as HealthRecord[]}
        weightLogs={(weightLogs ?? []) as WeightLog[]}
        upcomingReminders={upcomingReminders as Reminder[]}
        completedReminders={completedReminders as Reminder[]}
        media={(media ?? []) as PetMedia[]}
        petId={params.id}
      />
    </div>
  );
}
