"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function DownloadSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-petoo-500 via-petoo-600 to-coral-500 overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-32 -translate-y-32" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-48 translate-y-48" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[200px] opacity-5 select-none">
        🐾
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-6xl mb-6">🐾</div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Prêt à offrir le meilleur à votre animal ?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Rejoignez 10 000+ familles qui font confiance à Petoo. Inscription gratuite, aucune carte bancaire requise.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href="/register"
              className="group flex items-center gap-2 bg-white text-petoo-500 font-semibold text-lg px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all active:scale-95 hover:bg-petoo-50"
            >
              Créer mon compte gratuit
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* App store badges */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur text-white px-5 py-3 rounded-2xl border border-white/20 cursor-pointer hover:bg-black/30 transition-colors">
              <span className="text-2xl"></span>
              <div className="text-left">
                <div className="text-xs opacity-70">Disponible sur</div>
                <div className="text-sm font-semibold">App Store</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur text-white px-5 py-3 rounded-2xl border border-white/20 cursor-pointer hover:bg-black/30 transition-colors">
              <span className="text-2xl">▶</span>
              <div className="text-left">
                <div className="text-xs opacity-70">Disponible sur</div>
                <div className="text-sm font-semibold">Google Play</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur text-white px-5 py-3 rounded-2xl border border-white/20 cursor-pointer hover:bg-black/30 transition-colors">
              <span className="text-2xl">🌐</span>
              <div className="text-left">
                <div className="text-xs opacity-70">Accès via</div>
                <div className="text-sm font-semibold">Web App</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
