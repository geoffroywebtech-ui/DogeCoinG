"use client";

import { motion } from "framer-motion";
import { Calendar, Scissors, Heart, MapPin, Gift, Stethoscope, Camera, Bell } from "lucide-react";

const features = [
  {
    icon: Calendar,
    emoji: "📅",
    color: "card-orange",
    iconColor: "text-petoo-500",
    title: "Calendrier Santé Intelligent",
    description:
      "Rappels automatiques pour les vaccins, vermifuges, médicaments et toilettages. Alertes personnalisées selon la race et l'âge de votre animal.",
    highlights: ["Rappels automatiques", "Alertes IA par race", "Compte famille partagé"],
  },
  {
    icon: Heart,
    emoji: "💖",
    color: "card-pink",
    iconColor: "text-coral-500",
    title: "Profil Complet de l'Animal",
    description:
      "Profil détaillé avec journal photo/vidéo, courbes de poids, historique de santé et conseils personnalisés par race.",
    highlights: ["Journal photo/vidéo", "Courbes de poids", "Historique santé"],
  },
  {
    icon: Scissors,
    emoji: "✂️",
    color: "card-purple",
    iconColor: "text-lavender-500",
    title: "Module Toilettage Complet",
    description:
      "Carte géolocalisée des toiletteurs, réservation en ligne, suivi GPS temps réel, fiche de séance avec photos avant/après.",
    highlights: ["Carte géolocalisée", "Suivi GPS temps réel", "Fiche de séance"],
  },
  {
    icon: Stethoscope,
    emoji: "🏥",
    color: "card-teal",
    iconColor: "text-teal-500",
    title: "Vétérinaires & Services",
    description:
      "Trouvez et réservez vétérinaires, gardes d'animaux et promeneurs. Bouton urgence vet en 1 tap avec géolocalisation.",
    highlights: ["Vétérinaire urgence", "Garde d'animaux", "Promeneurs"],
  },
  {
    icon: MapPin,
    emoji: "📍",
    color: "card-green",
    iconColor: "text-mint-500",
    title: "Mode Voyage",
    description:
      "Trouvez des professionnels vérifiés partout en France et en Europe. Idéal pour les voyages et les déplacements.",
    highlights: ["Toute la France", "Europe entière", "Pros vérifiés"],
  },
  {
    icon: Gift,
    emoji: "🎁",
    color: "card-yellow",
    iconColor: "text-sunshine-500",
    title: "Programme Fidélité",
    description:
      "Gagnez des points à chaque réservation, échangez-les contre des remises. 10ème toilettage offert automatiquement.",
    highlights: ["Points par réservation", "Remises exclusives", "10ème séance offerte"],
  },
  {
    icon: Camera,
    emoji: "📸",
    color: "card-orange",
    iconColor: "text-petoo-400",
    title: "Journal de Vie",
    description:
      "Timeline photo et vidéo pour immortaliser chaque moment de la vie de votre animal. Partagez avec toute la famille.",
    highlights: ["Timeline illimitée", "Partage famille", "Captions et souvenirs"],
  },
  {
    icon: Bell,
    emoji: "🔔",
    color: "card-pink",
    iconColor: "text-coral-400",
    title: "Alertes Intelligentes",
    description:
      "Notifications push intelligentes, alerte parasites détectés, rappel toilettage selon la race, alerte anomalie de santé.",
    highlights: ["Alerte parasites", "Rappel adapté race", "Anomalie santé"],
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-petoo-50 text-petoo-600 text-sm font-semibold px-4 py-2 rounded-full mb-4">
            ✨ Tout ce dont votre animal a besoin
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Une app, des centaines de{" "}
            <span className="gradient-text">super-pouvoirs</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Petoo regroupe tout ce qu'il vous faut pour être le meilleur propriétaire possible
            — calendrier, santé, toilettage, services et récompenses.
          </p>
        </div>

        {/* Feature grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className={`rounded-2xl p-6 border transition-all hover:-translate-y-1 hover:shadow-lg cursor-default ${f.color}`}
            >
              <div className="text-3xl mb-3">{f.emoji}</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{f.description}</p>
              <ul className="space-y-1.5">
                {f.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-xs font-medium text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0 opacity-60" />
                    {h}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
