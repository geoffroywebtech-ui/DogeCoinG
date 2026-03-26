"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    emoji: "📲",
    color: "bg-petoo-100 border-petoo-300",
    numberColor: "text-petoo-500",
    title: "Créez votre compte gratuit",
    description: "Inscrivez-vous en 30 secondes avec votre email. Aucune carte bancaire requise.",
  },
  {
    number: "02",
    emoji: "🐾",
    color: "bg-teal-50 border-teal-200",
    numberColor: "text-teal-500",
    title: "Ajoutez votre animal",
    description: "Chien, chat ou lapin — remplissez son profil avec sa race, son âge et ses informations de santé.",
  },
  {
    number: "03",
    emoji: "📅",
    color: "bg-lavender-50 border-lavender-200",
    numberColor: "text-lavender-500",
    title: "Activez les rappels intelligents",
    description: "Petoo analyse la race et l'âge pour générer automatiquement un calendrier santé personnalisé.",
  },
  {
    number: "04",
    emoji: "✂️",
    color: "bg-sunshine-100 border-yellow-200",
    numberColor: "text-sunshine-600",
    title: "Réservez vos premiers services",
    description: "Trouvez un toiletteur, un vétérinaire ou un promeneur géolocalisé et réservez en 2 taps.",
  },
  {
    number: "05",
    emoji: "🎁",
    color: "bg-coral-50 border-coral-200",
    numberColor: "text-coral-500",
    title: "Gagnez des récompenses",
    description: "Chaque réservation vous rapporte des points fidélité. Échangez-les contre des remises exclusives.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 text-sm font-semibold px-4 py-2 rounded-full mb-4">
            🚀 Démarrez en 5 minutes
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            De l'inscription à la première réservation, Petoo vous guide à chaque étape.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-petoo-200 via-teal-200 to-lavender-200 mx-32" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="flex flex-col items-center text-center"
              >
                {/* Circle */}
                <div
                  className={`relative w-16 h-16 rounded-2xl border-2 ${step.color} flex items-center justify-center text-3xl mb-4 shadow-sm`}
                >
                  {step.emoji}
                  <span
                    className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border-2 border-gray-200 text-xs font-bold flex items-center justify-center ${step.numberColor}`}
                  >
                    {i + 1}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-base mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
