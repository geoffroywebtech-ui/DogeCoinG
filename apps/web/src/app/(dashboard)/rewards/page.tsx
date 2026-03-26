import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Gift, Star, ArrowRight, Zap } from "lucide-react";

export const metadata = { title: "Récompenses & Fidélité" };

const LOYALTY_REWARDS = [
  { points: 100, label: "5% de réduction sur votre prochain service", emoji: "💰", color: "card-yellow" },
  { points: 250, label: "10% de réduction sur votre prochain service", emoji: "🎁", color: "card-orange" },
  { points: 500, label: "Séance de toilettage à -20€", emoji: "✂️", color: "card-purple" },
  { points: 1000, label: "Une séance de toilettage OFFERTE", emoji: "🏆", color: "card-teal" },
  { points: 2000, label: "1 mois Premium OFFERT", emoji: "⭐", color: "card-pink" },
];

export default async function RewardsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: transactions }] = await Promise.all([
    supabase.from("profiles").select("loyalty_points, subscription_tier").eq("id", user.id).single(),
    supabase.from("loyalty_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
  ]);

  const points = profile?.loyalty_points ?? 0;
  const nextReward = LOYALTY_REWARDS.find((r) => r.points > points);
  const progressToNext = nextReward ? (points / nextReward.points) * 100 : 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <span>🎁</span> Programme Fidélité
        </h1>
        <p className="text-gray-600 mt-1">Gagnez des points à chaque réservation et échangez-les contre des récompenses.</p>
      </div>

      {/* Points card */}
      <div className="bg-gradient-to-br from-petoo-500 to-coral-500 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute right-6 top-6 text-6xl opacity-20 select-none">🐾</div>
        <p className="text-white/80 font-medium mb-1">Vos points fidélité</p>
        <div className="flex items-end gap-3 mb-4">
          <span className="text-6xl font-bold">{points.toLocaleString("fr")}</span>
          <span className="text-white/70 text-xl mb-1">pts</span>
        </div>

        {/* Progress bar */}
        {nextReward && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">Prochain palier : {nextReward.label}</span>
              <span className="font-semibold">{nextReward.points - points} pts restants</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${Math.min(progressToNext, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Tier badge */}
        <div className="mt-4">
          <span className="bg-white/20 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full capitalize">
            {profile?.subscription_tier === "premium" ? "⭐ Membre Premium (2× points)" : "Membre Free"}
          </span>
        </div>
      </div>

      {/* Rewards catalogue */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-sunshine-500" />
          Récompenses disponibles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LOYALTY_REWARDS.map((reward) => {
            const canRedeem = points >= reward.points;
            return (
              <div
                key={reward.points}
                className={`rounded-2xl p-5 border flex items-center gap-4 transition-all ${reward.color} ${canRedeem ? "hover:-translate-y-0.5 hover:shadow-md" : "opacity-60"}`}
              >
                <div className="text-4xl">{reward.emoji}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{reward.label}</p>
                  <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-sunshine-400 text-sunshine-400" />
                    {reward.points.toLocaleString("fr")} points
                  </p>
                </div>
                <button
                  disabled={!canRedeem}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                    canRedeem
                      ? "bg-petoo-500 text-white hover:bg-petoo-600 cursor-pointer"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {canRedeem ? "Échanger" : `${reward.points - points} pts`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* How to earn */}
      <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-teal-500" />
          Comment gagner des points ?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { action: "Chaque réservation confirmée", pts: "= prix de la séance en points", emoji: "📅" },
            { action: "Abonnement Premium", pts: "2× points sur toutes les réservations", emoji: "⭐" },
            { action: "Invitation d'un ami", pts: "+50 points bonus", emoji: "👥" },
            { action: "Compléter votre profil", pts: "+20 points", emoji: "✅" },
            { action: "Laisser un avis", pts: "+10 points par avis", emoji: "⭐" },
            { action: "10ème séance chez le même pro", pts: "Séance offerte automatique", emoji: "🎉" },
          ].map((item) => (
            <div key={item.action} className="flex items-start gap-3 bg-white/70 rounded-xl p-3">
              <span className="text-2xl">{item.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{item.action}</p>
                <p className="text-xs text-teal-700 font-medium">{item.pts}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction history */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-lavender-500" />
          Historique des transactions
        </h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {transactions && transactions.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center gap-4 p-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                    t.type === "earned" ? "bg-teal-100" : t.type === "redeemed" ? "bg-coral-100" : "bg-gray-100"
                  }`}>
                    {t.type === "earned" ? "➕" : t.type === "redeemed" ? "🎁" : "💫"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{t.description}</p>
                    <p className="text-xs text-gray-500">{formatDate(t.created_at)}</p>
                  </div>
                  <span className={`text-sm font-bold flex-shrink-0 ${
                    t.type === "earned" ? "text-teal-600" : "text-red-500"
                  }`}>
                    {t.type === "earned" ? "+" : "-"}{Math.abs(t.points)} pts
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">🌟</div>
              <p className="text-gray-500">Aucune transaction encore.</p>
              <p className="text-sm text-gray-400 mt-1">Faites votre première réservation pour gagner des points !</p>
              <Link href="/grooming" className="inline-block mt-4 text-petoo-500 font-semibold hover:underline text-sm">
                Trouver un toiletteur →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
