"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/reset-password`,
    });

    setLoading(false);
    if (error) {
      setError("Une erreur est survenue. Vérifiez l'adresse email.");
      return;
    }
    setSent(true);
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        {sent ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📬</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email envoyé !</h1>
            <p className="text-gray-600 mb-6">
              Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.
            </p>
            <Link href="/login" className="text-petoo-500 font-semibold hover:underline">
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">🔑</div>
              <h1 className="text-2xl font-bold text-gray-900">Mot de passe oublié</h1>
              <p className="text-gray-500 text-sm mt-1">
                Entrez votre email et nous vous enverrons un lien de réinitialisation.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="votre@email.fr"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-petoo-200 focus:border-petoo-400 transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-petoo-500 hover:bg-petoo-600 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Envoi en cours…" : "Envoyer le lien"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              <Link href="/login" className="text-petoo-500 font-semibold hover:underline">
                ← Retour à la connexion
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
