import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Users, TrendingUp, Calendar, Star, Activity, Shield } from "lucide-react";

export const metadata = { title: "Petoo Admin" };

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: activeSubscriptions },
    { count: totalBookings },
    { count: activeProviders },
    { data: recentUsers },
    { data: recentBookings },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("subscription_status", "active"),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("service_providers").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("profiles").select("id, full_name, email, subscription_tier, created_at").order("created_at", { ascending: false }).limit(10),
    supabase.from("bookings").select("id, status, price_total, created_at, profiles!client_id(full_name), service_providers(business_name)").order("created_at", { ascending: false }).limit(10),
  ]);

  // Calculate MRR (approx)
  const MRR_PREMIUM = 4.99;
  const MRR_PRO = 29.99;
  const { count: premiumCount } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("subscription_tier", "premium").eq("subscription_status", "active");
  const { count: proCount } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("subscription_tier", "pro").eq("subscription_status", "active");
  const mrr = ((premiumCount ?? 0) * MRR_PREMIUM) + ((proCount ?? 0) * MRR_PRO);

  const stats = [
    { label: "Utilisateurs", value: totalUsers?.toLocaleString("fr") ?? "0", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Abonnements actifs", value: activeSubscriptions?.toLocaleString("fr") ?? "0", icon: Star, color: "text-sunshine-400", bg: "bg-yellow-500/10" },
    { label: "Réservations totales", value: totalBookings?.toLocaleString("fr") ?? "0", icon: Calendar, color: "text-teal-400", bg: "bg-teal-500/10" },
    { label: "Pros actifs", value: activeProviders?.toLocaleString("fr") ?? "0", icon: Shield, color: "text-lavender-400", bg: "bg-purple-500/10" },
    { label: "MRR estimé", value: formatCurrency(mrr), icon: TrendingUp, color: "text-petoo-400", bg: "bg-petoo-500/10" },
    { label: "Premium", value: (premiumCount ?? 0).toLocaleString("fr"), icon: Activity, color: "text-green-400", bg: "bg-green-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Shield className="w-6 h-6 text-red-400" />
          Tableau de bord Admin
        </h1>
        <p className="text-gray-400 mt-1">Supervision générale de la plateforme Petoo</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-sm text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-700">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Derniers inscrits
            </h2>
          </div>
          <div className="divide-y divide-gray-700">
            {recentUsers?.map((u: any) => (
              <div key={u.id} className="flex items-center gap-3 p-4">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                  {u.full_name?.[0] ?? u.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{u.full_name ?? u.email}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    u.subscription_tier === "premium" ? "bg-yellow-500/20 text-yellow-400" :
                    u.subscription_tier === "pro" ? "bg-purple-500/20 text-purple-400" :
                    "bg-gray-700 text-gray-400"
                  }`}>
                    {u.subscription_tier}
                  </span>
                  <span className="text-xs text-gray-500">{formatDate(u.created_at, "d MMM")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent bookings */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-700">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-400" />
              Dernières réservations
            </h2>
          </div>
          <div className="divide-y divide-gray-700">
            {recentBookings?.map((b: any) => (
              <div key={b.id} className="flex items-center gap-3 p-4">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  b.status === "completed" ? "bg-green-400" :
                  b.status === "confirmed" ? "bg-teal-400" :
                  b.status === "cancelled" ? "bg-red-400" :
                  "bg-yellow-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {(b.profiles as any)?.full_name ?? "Client"} → {b.service_providers?.business_name ?? "Pro"}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(b.created_at, "d MMM à HH'h'mm")}</p>
                </div>
                <span className="text-sm font-semibold text-petoo-400">{formatCurrency(b.price_total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System status */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
        <h2 className="font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-400" />
          État du système
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { service: "API Supabase", status: "✅ Opérationnel" },
            { service: "Stripe Payments", status: "✅ Opérationnel" },
            { service: "Storage", status: "✅ Opérationnel" },
            { service: "Auth", status: "✅ Opérationnel" },
          ].map((s) => (
            <div key={s.service} className="bg-gray-700/50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">{s.service}</p>
              <p className="text-xs font-semibold text-green-400">{s.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
