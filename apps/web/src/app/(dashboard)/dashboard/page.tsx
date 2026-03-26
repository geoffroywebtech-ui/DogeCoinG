import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate, formatRelative, getSpeciesEmoji, getReminderTypeLabel, getReminderTypeColor, formatCurrency } from "@/lib/utils";
import { Calendar, Scissors, Gift, AlertCircle, Plus, ArrowRight } from "lucide-react";

export const metadata = { title: "Tableau de bord" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: profile },
    { data: pets },
    { data: reminders },
    { data: bookings },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("pets").select("*").eq("owner_id", user.id).eq("is_active", true).limit(10),
    supabase.from("reminders").select("*, pets(name, species)").eq("user_id", user.id).eq("is_completed", false).order("due_date").limit(5),
    supabase.from("bookings").select("*, service_providers(business_name), pets(name), provider_services(name)").eq("client_id", user.id).in("status", ["pending", "confirmed"]).order("scheduled_at").limit(3),
  ]);

  const firstName = profile?.full_name?.split(" ")[0] ?? "là";

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-br from-petoo-500 to-petoo-600 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute right-4 top-4 text-6xl opacity-20 select-none">🐾</div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">
          Bonjour {firstName} 👋
        </h1>
        <p className="text-white/80">
          {pets && pets.length > 0
            ? `Vous avez ${pets.length} animal${pets.length > 1 ? "aux" : ""} enregistré${pets.length > 1 ? "s" : ""}.`
            : "Ajoutez votre premier animal pour commencer !"}
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          <Link
            href="/pets/new"
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-full backdrop-blur transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter un animal
          </Link>
          <Link
            href="/grooming"
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-full backdrop-blur transition-colors"
          >
            <Scissors className="w-4 h-4" />
            Trouver un toiletteur
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Mes animaux", value: pets?.length ?? 0, emoji: "🐾", color: "card-orange", href: "/pets" },
          { label: "Rappels actifs", value: reminders?.length ?? 0, emoji: "⏰", color: "card-teal", href: "/calendar" },
          { label: "RDV à venir", value: bookings?.length ?? 0, emoji: "📅", color: "card-purple", href: "/grooming" },
          { label: "Points fidélité", value: profile?.loyalty_points ?? 0, emoji: "⭐", color: "card-yellow", href: "/rewards" },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`rounded-2xl p-5 border transition-all hover:-translate-y-0.5 hover:shadow-md ${stat.color}`}
          >
            <div className="text-3xl mb-2">{stat.emoji}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString("fr")}</div>
            <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My pets */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Mes animaux</h2>
              <Link href="/pets" className="text-xs text-petoo-500 hover:underline font-medium">
                Voir tous
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {pets && pets.length > 0 ? (
                pets.map((pet) => (
                  <Link
                    key={pet.id}
                    href={`/pets/${pet.id}`}
                    className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-petoo-100 to-lavender-100 flex items-center justify-center text-xl flex-shrink-0">
                      {pet.avatar_url
                        ? <img src={pet.avatar_url} className="w-full h-full object-cover rounded-full" alt="" />
                        : getSpeciesEmoji(pet.species)
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{pet.name}</p>
                      <p className="text-xs text-gray-500">{pet.breed ?? pet.species}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300" />
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-2">🐾</div>
                  <p className="text-gray-500 text-sm mb-3">Aucun animal encore</p>
                  <Link href="/pets/new" className="text-sm text-petoo-500 font-semibold hover:underline">
                    + Ajouter mon premier animal
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming reminders */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-500" />
                Prochains rappels
              </h2>
              <Link href="/calendar" className="text-xs text-petoo-500 hover:underline font-medium">
                Calendrier complet
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {reminders && reminders.length > 0 ? (
                reminders.map((r: any) => (
                  <div key={r.id} className="p-4 flex items-center gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {r.type === "vaccine" ? "💉" : r.type === "deworming" ? "💊" : r.type === "grooming" ? "✂️" : "🏥"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 text-sm">{r.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getReminderTypeColor(r.type)}`}>
                          {getReminderTypeLabel(r.type)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {r.pets?.name} · {formatRelative(r.due_date)}
                      </p>
                    </div>
                    <p className="text-xs font-medium text-gray-500 flex-shrink-0">
                      {formatDate(r.due_date, "d MMM")}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-gray-500 text-sm mb-3">Aucun rappel en attente</p>
                  <Link href="/calendar" className="text-sm text-petoo-500 font-semibold hover:underline">
                    + Ajouter un rappel
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming bookings */}
      {bookings && bookings.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Scissors className="w-4 h-4 text-lavender-500" />
              Prochains rendez-vous
            </h2>
            <Link href="/grooming" className="text-xs text-petoo-500 hover:underline font-medium">
              Tous les RDV
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {bookings.map((b: any) => (
              <div key={b.id} className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${b.status === "confirmed" ? "bg-teal-400" : "bg-yellow-400"}`} />
                  <span className="text-xs font-medium text-gray-500 capitalize">{b.status === "confirmed" ? "Confirmé" : "En attente"}</span>
                </div>
                <p className="font-bold text-gray-900 text-sm">{b.service_providers?.business_name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{b.provider_services?.name} · {b.pets?.name}</p>
                <p className="text-sm font-semibold text-petoo-500 mt-2">{formatDate(b.scheduled_at, "d MMM à HH'h'mm")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upgrade CTA (free users) */}
      {profile?.subscription_tier === "free" && (
        <div className="bg-gradient-to-r from-lavender-100 to-petoo-50 border border-lavender-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Passez à Premium 🚀</h3>
            <p className="text-gray-600 text-sm mt-1">
              Rappels intelligents, jusqu'à 5 animaux, compte famille et bien plus.
            </p>
          </div>
          <Link
            href="/settings?tab=subscription"
            className="flex-shrink-0 bg-petoo-500 hover:bg-petoo-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md"
          >
            Voir les offres
          </Link>
        </div>
      )}
    </div>
  );
}
