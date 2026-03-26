"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star, Shield, Zap } from "lucide-react";

const ANIMAL_EMOJIS = ["🐕", "🐈", "🐇", "🐾", "🦮", "🐩", "😸", "🐱"];

const floatingAnimals = [
  { emoji: "🐕", x: "10%", y: "20%", delay: 0 },
  { emoji: "🐈", x: "85%", y: "15%", delay: 0.3 },
  { emoji: "🐇", x: "75%", y: "60%", delay: 0.6 },
  { emoji: "🐾", x: "5%", y: "70%", delay: 0.9 },
  { emoji: "🦮", x: "90%", y: "80%", delay: 1.2 },
  { emoji: "😸", x: "20%", y: "85%", delay: 1.5 },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient paw-pattern pt-16">
      {/* Floating animals */}
      {floatingAnimals.map((a, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl select-none pointer-events-none hidden lg:block"
          style={{ left: a.x, top: a.y }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.7, y: [0, -12, 0] }}
          transition={{
            opacity: { delay: a.delay, duration: 0.6 },
            y: { delay: a.delay, duration: 3, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          {a.emoji}
        </motion.div>
      ))}

      {/* Gradient blobs */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-petoo-200/40 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lavender-100/30 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-petoo-200 text-petoo-600 text-sm font-semibold px-4 py-2 rounded-full mb-6 shadow-sm"
        >
          <Star className="w-4 h-4 fill-petoo-400 text-petoo-400" />
          <span>L'app #1 pour les animaux de compagnie en France</span>
          <Star className="w-4 h-4 fill-petoo-400 text-petoo-400" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-tight mb-6"
        >
          Tout pour votre{" "}
          <span className="gradient-text">animal chéri</span>
          <br />
          dans une seule app 🐾
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-10"
        >
          Calendrier santé intelligent, toiletteurs géolocalisés, vétérinaires à portée de tap,
          programme fidélité — <strong>Petoo</strong> gère tout pour que vous profitiez plus de votre compagnon.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Link
            href="/register"
            className="group flex items-center gap-2 bg-petoo-500 hover:bg-petoo-600 text-white font-semibold text-lg px-8 py-4 rounded-full shadow-xl shadow-petoo-500/30 hover:shadow-petoo-500/50 transition-all active:scale-95"
          >
            Commencer gratuitement
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 text-gray-700 hover:text-petoo-500 font-semibold text-lg px-8 py-4 rounded-full border border-gray-200 hover:border-petoo-300 transition-all bg-white/70 backdrop-blur"
          >
            Voir comment ça marche
          </a>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500"
        >
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-teal-500" />
            <span>100% sécurisé</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-sunshine-500" />
            <span>Gratuit pour commencer</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base">📱</span>
            <span>iOS & Android & Web</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base">🐕🐈🐇</span>
            <span>Chiens, chats, lapins</span>
          </div>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-14 flex items-center justify-center gap-3"
        >
          <div className="flex -space-x-3">
            {["🧑", "👩", "👨", "🧑‍🦱", "👩‍🦰"].map((e, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-petoo-100 to-teal-100 border-2 border-white flex items-center justify-center text-lg shadow"
              >
                {e}
              </div>
            ))}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-sunshine-400 text-sunshine-400" />
              ))}
            </div>
            <p className="text-sm text-gray-600">
              <strong className="text-gray-900">+10 000</strong> familles font confiance à Petoo
            </p>
          </div>
        </motion.div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80L1440 80L1440 40C1200 80 960 0 720 20C480 40 240 80 0 40L0 80Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
