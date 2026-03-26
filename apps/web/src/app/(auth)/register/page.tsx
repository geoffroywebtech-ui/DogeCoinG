"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    full_name: z.string().min(2, "Prénom et nom requis (min. 2 caractères)"),
    email: z.string().email("Adresse email invalide"),
    password: z.string().min(8, "Mot de passe : 8 caractères minimum"),
    confirm_password: z.string(),
    accept_terms: z.boolean().refine((v) => v === true, "Vous devez accepter les CGU"),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm_password"],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [showPwd, setShowPwd] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setServerError(error.message === "User already registered"
        ? "Un compte existe déjà avec cet email."
        : error.message);
      return;
    }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
        <div className="text-6xl mb-4">📬</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vérifiez votre email !</h2>
        <p className="text-gray-600 mb-6">
          Un lien de confirmation a été envoyé à votre adresse email. Cliquez dessus pour activer votre compte.
        </p>
        <Link href="/login" className="text-petoo-500 font-semibold hover:underline">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🐾</div>
          <h1 className="text-2xl font-bold text-gray-900">Créer votre compte</h1>
          <p className="text-gray-500 text-sm mt-1">Gratuit, sans carte bancaire</p>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom et nom</label>
            <input
              {...register("full_name")}
              type="text"
              placeholder="Sophie Martin"
              className={cn(
                "w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all text-sm",
                errors.full_name ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-petoo-200 focus:border-petoo-400"
              )}
            />
            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              {...register("email")}
              type="email"
              placeholder="sophie@exemple.fr"
              className={cn(
                "w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all text-sm",
                errors.email ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-petoo-200 focus:border-petoo-400"
              )}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPwd ? "text" : "password"}
                placeholder="8 caractères minimum"
                className={cn(
                  "w-full px-4 py-3 pr-10 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all text-sm",
                  errors.password ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-petoo-200 focus:border-petoo-400"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer le mot de passe</label>
            <input
              {...register("confirm_password")}
              type={showPwd ? "text" : "password"}
              placeholder="Répétez votre mot de passe"
              className={cn(
                "w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all text-sm",
                errors.confirm_password ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-petoo-200 focus:border-petoo-400"
              )}
            />
            {errors.confirm_password && (
              <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>
            )}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2.5">
            <input
              {...register("accept_terms")}
              type="checkbox"
              id="terms"
              className="w-4 h-4 rounded border-gray-300 text-petoo-500 focus:ring-petoo-400 mt-0.5"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              J'accepte les{" "}
              <a href="#" className="text-petoo-500 hover:underline font-medium">CGU</a> et la{" "}
              <a href="#" className="text-petoo-500 hover:underline font-medium">Politique de confidentialité</a>
            </label>
          </div>
          {errors.accept_terms && (
            <p className="text-red-500 text-xs -mt-2">{errors.accept_terms.message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-petoo-500 hover:bg-petoo-600 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isSubmitting ? "Création en cours…" : "Créer mon compte gratuit 🐾"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-petoo-500 font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
