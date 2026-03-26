import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-white mb-3">
              <span>🐾</span>
              <span>Petoo</span>
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              L'app tout-en-un pour les propriétaires de chiens, chats et lapins.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-petoo-500 rounded-full flex items-center justify-center transition-colors text-sm">f</a>
              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-petoo-500 rounded-full flex items-center justify-center transition-colors text-sm">t</a>
              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-petoo-500 rounded-full flex items-center justify-center transition-colors text-sm">in</a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4">Produit</h4>
            <ul className="space-y-2 text-sm">
              {["Fonctionnalités", "Tarifs", "App iOS", "App Android", "Blog"].map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-white transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Professionnels */}
          <div>
            <h4 className="text-white font-semibold mb-4">Professionnels</h4>
            <ul className="space-y-2 text-sm">
              {["Devenir Pro Petoo", "Tableau de bord Pro", "Tarifs Pro", "Aide Pro"].map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-white transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Légal</h4>
            <ul className="space-y-2 text-sm">
              {["Mentions légales", "CGU", "RGPD", "Cookies", "Contact"].map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-white transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>© 2026 Petoo. Tous droits réservés.</p>
          <div className="flex items-center gap-2 text-gray-500">
            <span>Fait avec</span>
            <span className="text-red-400">❤️</span>
            <span>en France 🇫🇷</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
