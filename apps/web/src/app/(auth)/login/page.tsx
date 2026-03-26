"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const supabase = createClient();
  const [showPwd, setShowPwd] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setServerError(
        error.message.includes("Invalid")
          ? "Email ou mot de passe incorrect."
          : "Email non confirmé. Vérifiez votre boîte mail."
      );
      return;
    }
    router.push(redirect);
    router.refresh();
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🐾</div>
          <h1 className="text-2xl font-bold text-gray-900">Bon retour !</h1>
          <p className="text-gray-500 text-sm mt-1">Connectez-vous à votre compte Petoo</p>
        </div>

        {searchParams.get("message") && (
          <div className="bg-teal-50 border border-teal-200 text-teal-700 text-sm rounded-xl px-4 py-3 mb-5">
            {searchParams.get("message")}
          </div>
        )}

        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              {...register("email")}
              type="email"
              placeholder="votre@email.fr"
              autoComplete="email"
              className={cn(
                "w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all text-sm",
                errors.email ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-petoo-200 focus:border-petoo-400"
              )}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700">Mot de passe</label>
              <Link href="/forgot-password" className="text-xs text-petoo-500 hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="relative">
              <input
                {...register("password")}
                type={showPwd ? "text" : "password"}
                placeholder="Votre mot de passe"
                autoComplete="current-password"
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-petoo-500 hover:bg-petoo-600 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? "Connexion en cours…" : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-petoo-500 font-semibold hover:underline">
            Inscription gratuite
          </Link>
        </p>
      </div>
    </div>
  );
}
