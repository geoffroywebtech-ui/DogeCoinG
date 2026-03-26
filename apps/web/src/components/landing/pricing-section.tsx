"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { PLANS } from "@/lib/stripe";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function PricingSection() {
  const [annual, setAnnual] = useState(false);

  const plans = Object.values(PLANS);

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-sunshine-100 text-sunshine-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
            💰 Tarifs transparents
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Simple, honnête,{" "}
            <span className="gradient-text">sans surprise</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Commencez gratuitement. Upgradez quand vous en avez besoin.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-gray-100 p-1 rounded-full">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-semibold transition-all",
                !annual ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              Mensuel
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2",
                annual ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              Annuel
              <span className="bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.tier}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "relative rounded-3xl p-8 border-2 flex flex-col",
                plan.is_popular
                  ? "border-petoo-400 bg-gradient-to-br from-petoo-500 to-petoo-600 text-white shadow-2xl shadow-petoo-500/25 scale-105"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg transition-all"
              )}
            >
              {plan.is_popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-sunshine-400 text-gray-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                    ⭐ Le plus populaire
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className="text-3xl mb-2">
                  {plan.tier === "free" ? "🐣" : plan.tier === "premium" ? "⭐" : "🏆"}
                </div>
                <h3 className={cn("text-xl font-bold mb-1", plan.is_popular ? "text-white" : "text-gray-900")}>
                  {plan.name}
                </h3>
                <div className={cn("text-4xl font-bold mt-4", plan.is_popular ? "text-white" : "text-gray-900")}>
                  {plan.price_monthly === 0 ? (
                    "Gratuit"
                  ) : (
                    <>
                      {formatCurrency(annual ? plan.price_yearly / 12 : plan.price_monthly)}
                      <span className={cn("text-base font-normal ml-1", plan.is_popular ? "text-white/70" : "text-gray-500")}>
                        /mois
                      </span>
                    </>
                  )}
                </div>
                {annual && plan.price_yearly > 0 && (
                  <p className={cn("text-sm mt-1", plan.is_popular ? "text-white/70" : "text-gray-500")}>
                    Facturé {formatCurrency(plan.price_yearly)}/an
                  </p>
                )}
                {plan.max_pets > 0 && (
                  <p className={cn("text-sm mt-2 font-medium", plan.is_popular ? "text-white/80" : "text-gray-600")}>
                    Jusqu'à {plan.max_pets} animaux
                  </p>
                )}
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                        plan.is_popular ? "bg-white/20" : "bg-teal-100"
                      )}
                    >
                      <Check
                        className={cn(
                          "w-3 h-3",
                          plan.is_popular ? "text-white" : "text-teal-600"
                        )}
                        strokeWidth={3}
                      />
                    </div>
                    <span className={cn("text-sm", plan.is_popular ? "text-white/90" : "text-gray-600")}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={cn(
                  "block text-center font-semibold py-3.5 rounded-2xl transition-all",
                  plan.is_popular
                    ? "bg-white text-petoo-500 hover:bg-petoo-50 shadow-lg"
                    : plan.tier === "free"
                    ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    : "bg-petoo-500 text-white hover:bg-petoo-600 shadow-md shadow-petoo-500/30"
                )}
              >
                {plan.price_monthly === 0 ? "Commencer gratuitement" : "Choisir ce plan"}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Tous les plans incluent un essai gratuit de 14 jours. Annulez à tout moment, sans frais.
          <br />
          Paiement sécurisé par <strong>Stripe</strong> — CB, Apple Pay, Google Pay.
        </p>
      </div>
    </section>
  );
}
