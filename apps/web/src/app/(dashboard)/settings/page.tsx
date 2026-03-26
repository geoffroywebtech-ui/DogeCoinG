"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, User, CreditCard, Bell, Shield, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PLANS, formatPrice } from "@/lib/stripe";
import { cn, formatCurrency } from "@/lib/utils";
import type { UserProfile } from "@/types";

const profileSchema = z.object({
  full_name: z.string().min(2, "Prénom et nom requis"),
  phone: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
});
type ProfileData = z.infer<typeof profileSchema>;

const tabs = [
  { id: "profile", label: "Profil", icon: User },
  { id: "subscription", label: "Abonnement", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Sécurité", icon: Shield },
];

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "profile";
  const supabase = createClient();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [annual, setAnnual] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);
      if (data) reset({ full_name: data.full_name ?? "", phone: data.phone ?? "", city: data.city ?? "", address: data.address ?? "" });
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const onSaveProfile = async (data: ProfileData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update(data).eq("id", user.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCheckout = async (tier: string) => {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier, annual }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  const handlePortal = async () => {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-petoo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
        <span>⚙️</span> Paramètres
      </h1>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Tab sidebar */}
        <nav className="sm:w-52 flex sm:flex-col gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => router.push(`/settings?tab=${tab.id}`)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left",
                activeTab === tab.id
                  ? "bg-petoo-50 text-petoo-600"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-petoo-500" : "text-gray-400")} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1">
          {/* Profile tab */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Mon profil</h2>

              {/* Avatar section */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-petoo-200 to-lavender-200 flex items-center justify-center text-2xl font-bold text-petoo-700">
                  {profile?.full_name?.[0] ?? "?"}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{profile?.full_name ?? "Votre nom"}</p>
                  <p className="text-sm text-gray-500">{profile?.email}</p>
                  <button className="text-xs text-petoo-500 hover:underline mt-1 font-medium">
                    Changer la photo
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
                {[
                  { name: "full_name" as const, label: "Prénom et nom", placeholder: "Sophie Martin", type: "text" },
                  { name: "phone" as const, label: "Téléphone", placeholder: "+33 6 12 34 56 78", type: "tel" },
                  { name: "city" as const, label: "Ville", placeholder: "Paris", type: "text" },
                  { name: "address" as const, label: "Adresse", placeholder: "12 rue de la Paix", type: "text" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
                    <input
                      {...register(field.name)}
                      type={field.type}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-petoo-200 focus:border-petoo-400 transition-all text-sm"
                    />
                    {errors[field.name] && (
                      <p className="text-red-500 text-xs mt-1">{errors[field.name]?.message}</p>
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-petoo-500 hover:bg-petoo-600 text-white font-semibold px-6 py-3 rounded-xl transition-all"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {saved ? (
                    <>
                      <Check className="w-4 h-4" /> Sauvegardé !
                    </>
                  ) : isSubmitting ? "Sauvegarde…" : "Sauvegarder les changements"}
                </button>
              </form>
            </div>
          )}

          {/* Subscription tab */}
          {activeTab === "subscription" && (
            <div className="space-y-6">
              {/* Current plan */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Abonnement actuel</h2>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-gray-900 capitalize">
                      {profile?.subscription_tier === "free" ? "🐣 Gratuit" :
                       profile?.subscription_tier === "premium" ? "⭐ Premium" : "🏆 Pro"}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {profile?.subscription_status === "active" ? "✅ Actif" : "Version gratuite"}
                    </p>
                  </div>
                  {profile?.subscription_tier !== "free" && (
                    <button onClick={handlePortal} className="text-sm text-petoo-500 font-semibold hover:underline">
                      Gérer l'abonnement →
                    </button>
                  )}
                </div>
              </div>

              {/* Toggle annual */}
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => setAnnual(false)} className={cn("px-4 py-2 rounded-full text-sm font-semibold transition-all", !annual ? "bg-petoo-500 text-white" : "bg-gray-100 text-gray-600")}>
                  Mensuel
                </button>
                <button onClick={() => setAnnual(true)} className={cn("px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2", annual ? "bg-petoo-500 text-white" : "bg-gray-100 text-gray-600")}>
                  Annuel
                  <span className="bg-teal-100 text-teal-700 text-xs px-1.5 py-0.5 rounded-full">-17%</span>
                </button>
              </div>

              {/* Plan cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.values(PLANS).map((plan) => {
                  const isCurrentPlan = profile?.subscription_tier === plan.tier;
                  return (
                    <div
                      key={plan.tier}
                      className={cn(
                        "rounded-2xl p-5 border-2 transition-all",
                        plan.is_popular ? "border-petoo-400 bg-petoo-50" : "border-gray-200 bg-white",
                        isCurrentPlan && "border-teal-400 bg-teal-50"
                      )}
                    >
                      <div className="text-2xl mb-2">{plan.tier === "free" ? "🐣" : plan.tier === "premium" ? "⭐" : "🏆"}</div>
                      <h3 className="font-bold text-gray-900">{plan.name}</h3>
                      <div className="text-2xl font-bold text-gray-900 mt-2">
                        {plan.price_monthly === 0 ? "Gratuit" : `${formatCurrency(annual ? plan.price_yearly / 12 : plan.price_monthly)}/mois`}
                      </div>
                      <ul className="mt-3 space-y-1">
                        {plan.features.slice(0, 4).map((f) => (
                          <li key={f} className="text-xs text-gray-600 flex items-start gap-1.5">
                            <Check className="w-3 h-3 text-teal-500 flex-shrink-0 mt-0.5" strokeWidth={3} />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => !isCurrentPlan && plan.price_monthly > 0 && handleCheckout(plan.tier)}
                        disabled={isCurrentPlan}
                        className={cn(
                          "w-full mt-4 text-sm font-semibold py-2.5 rounded-xl transition-all",
                          isCurrentPlan
                            ? "bg-teal-100 text-teal-700 cursor-default"
                            : plan.price_monthly === 0
                            ? "bg-gray-100 text-gray-500 cursor-default"
                            : "bg-petoo-500 text-white hover:bg-petoo-600"
                        )}
                      >
                        {isCurrentPlan ? "✅ Plan actuel" : plan.price_monthly === 0 ? "Gratuit" : "Choisir ce plan"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notifications tab */}
          {activeTab === "notifications" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Préférences de notifications</h2>
              <div className="space-y-4">
                {[
                  { label: "Rappels de santé (vaccins, vermifuges...)", desc: "Recevez des alertes avant les dates importantes" },
                  { label: "Confirmations de réservation", desc: "Emails et push pour chaque booking" },
                  { label: "Messages des professionnels", desc: "Notifications pour les nouveaux messages" },
                  { label: "Alertes parasites / urgences", desc: "Alertes prioritaires en cas d'urgence" },
                  { label: "Offres et promotions", desc: "Découvrez les meilleures offres des pros Petoo" },
                  { label: "Newsletter Petoo", desc: "Conseils et actualités pour votre animal" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={i < 4} className="sr-only peer" />
                      <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-petoo-500" />
                    </label>
                  </div>
                ))}
              </div>
              <button className="mt-4 bg-petoo-500 hover:bg-petoo-600 text-white font-semibold px-6 py-3 rounded-xl transition-all">
                Sauvegarder les préférences
              </button>
            </div>
          )}

          {/* Security tab */}
          {activeTab === "security" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Sécurité du compte</h2>
              <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                <p className="text-sm font-medium text-gray-900">Email connecté</p>
                <p className="text-sm text-gray-600">{profile?.email}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Changer le mot de passe</h3>
                <button
                  onClick={async () => {
                    const supabase = createClient();
                    await supabase.auth.resetPasswordForEmail(profile?.email ?? "", {
                      redirectTo: `${window.location.origin}/auth/reset-password`,
                    });
                    alert("Email de réinitialisation envoyé !");
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
                >
                  Envoyer le lien de réinitialisation
                </button>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <h3 className="font-semibold text-red-600 mb-2">Zone dangereuse</h3>
                <p className="text-sm text-gray-500 mb-3">La suppression du compte est irréversible.</p>
                <button className="text-sm text-red-500 hover:text-red-700 font-medium underline">
                  Supprimer mon compte
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
