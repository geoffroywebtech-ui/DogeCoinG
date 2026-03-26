"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sophie M.",
    city: "Paris 11ème",
    animal: "Golden Retriever 🐕",
    avatar: "👩‍🦰",
    rating: 5,
    text: "Grâce à Petoo, j'ai enfin un suivi complet de la santé de Max. Les rappels automatiques me sauvent la vie — plus jamais de vaccin oublié !",
    highlight: "Rappels automatiques",
  },
  {
    name: "Thomas L.",
    city: "Lyon",
    animal: "Persan & Siamois 🐈",
    avatar: "👨‍🦱",
    rating: 5,
    text: "J'ai deux chats et le compte famille partagé est parfait — ma femme et moi avons les mêmes infos en temps réel. Le toiletteur qu'on a trouvé via la carte est fantastique.",
    highlight: "Compte famille partagé",
  },
  {
    name: "Marie C.",
    city: "Bordeaux",
    animal: "Lapin nain 🐇",
    avatar: "👩",
    rating: 5,
    text: "Même pour mon lapin, Petoo propose des conseils adaptés à sa race ! Le journal photo est adorable, toute la famille adore voir évoluer Caramel.",
    highlight: "Conseils par race",
  },
  {
    name: "Lucas B.",
    city: "Marseille",
    animal: "Labrador 🦮",
    avatar: "🧑",
    rating: 5,
    text: "Le programme fidélité est génial ! Après 10 toilettages, le 11ème était gratuit. Le toiletteur est venu chez moi en van équipé — ultra pratique.",
    highlight: "10ème séance offerte",
  },
  {
    name: "Amélie D.",
    city: "Nantes",
    animal: "British Shorthair 🐱",
    avatar: "👩‍🦱",
    rating: 5,
    text: "L'alerte urgence vétérinaire m'a sauvé la mise un dimanche soir — j'ai trouvé une clinique ouverte en 30 secondes. Service exceptionnel !",
    highlight: "Urgence vet en 1 tap",
  },
  {
    name: "Pierre G.",
    city: "Toulouse",
    animal: "Berger Australien 🐕",
    avatar: "👨",
    rating: 5,
    text: "En tant que toiletteur pro, le tableau de bord Petoo m'a permis de doubler ma clientèle en 3 mois. La gestion des réservations est un vrai plaisir.",
    highlight: "Pro Petoo certifié",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-coral-100 text-coral-600 text-sm font-semibold px-4 py-2 rounded-full mb-4">
            ❤️ Ils adorent Petoo
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            +10 000 familles{" "}
            <span className="gradient-text">nous font confiance</span>
          </h2>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-sunshine-400 text-sunshine-400" />
              ))}
            </div>
            <span className="font-semibold">4.9/5</span>
            <span>sur l'App Store & Google Play</span>
          </div>
        </div>

        {/* Testimonials grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="break-inside-avoid bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Stars */}
              <div className="flex mb-3">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-sunshine-400 text-sunshine-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 text-sm leading-relaxed mb-4">"{t.text}"</p>

              {/* Highlight tag */}
              <div className="inline-block bg-teal-50 text-teal-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-4">
                ✓ {t.highlight}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-petoo-100 to-lavender-100 flex items-center justify-center text-xl border border-white shadow">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-gray-500 text-xs">
                    {t.city} · {t.animal}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
