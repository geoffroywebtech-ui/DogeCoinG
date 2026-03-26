"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Camera,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const petSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(50, "Maximum 50 caractères"),
  species: z.enum(["dog", "cat", "rabbit"], {
    required_error: "Choisissez une espèce",
  }),
  breed: z.string().max(80).optional(),
  gender: z.enum(["male", "female"], { required_error: "Choisissez un genre" }),
  birth_date: z.string().optional(),
  weight_kg: z
    .string()
    .optional()
    .transform((v) => (v ? parseFloat(v) : undefined))
    .refine((v) => v === undefined || (!isNaN(v) && v > 0 && v < 200), {
      message: "Poids invalide (entre 0 et 200 kg)",
    }),
  bio: z.string().max(300, "Maximum 300 caractères").optional(),
});

type PetFormData = z.input<typeof petSchema>;

const SPECIES_OPTIONS = [
  { value: "dog", emoji: "🐕", label: "Chien", color: "from-sunshine-100 to-petoo-100 border-sunshine-300" },
  { value: "cat", emoji: "🐈", label: "Chat", color: "from-lavender-100 to-teal-50 border-lavender-300" },
  { value: "rabbit", emoji: "🐇", label: "Lapin", color: "from-mint-100 to-teal-100 border-mint-300" },
] as const;

export default function NewPetPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
    defaultValues: { gender: "male" },
  });

  const selectedSpecies = watch("species");
  const selectedGender = watch("gender");
  const bioValue = watch("bio") ?? "";

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function onSubmit(data: PetFormData) {
    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const payload: Record<string, unknown> = {
        owner_id: user.id,
        name: data.name,
        species: data.species,
        gender: data.gender,
        is_active: true,
      };
      if (data.breed) payload.breed = data.breed;
      if (data.birth_date) payload.birth_date = data.birth_date;
      if (data.weight_kg !== undefined) payload.weight_kg = data.weight_kg;
      if (data.bio) payload.bio = data.bio;
      // Avatar URL would be set after uploading to Supabase Storage
      if (avatarPreview) payload.avatar_url = null; // placeholder: store after upload

      const { error: insertError } = await supabase
        .from("pets")
        .insert(payload);

      if (insertError) throw new Error(insertError.message);

      setSuccess(true);
      setTimeout(() => router.push("/pets"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        href="/pets"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à mes animaux
      </Link>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-petoo-500 to-petoo-600 px-6 py-8 text-white relative overflow-hidden">
          <div className="absolute right-6 top-4 text-6xl opacity-20 select-none">🐾</div>
          <h1 className="text-2xl font-bold mb-1">Ajouter un animal 🐾</h1>
          <p className="text-white/75 text-sm">
            Remplissez les informations de votre compagnon
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Avatar upload */}
          <div className="flex justify-center">
            <div className="relative">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-petoo-50 to-teal-50 flex items-center justify-center overflow-hidden hover:opacity-90 transition-opacity group"
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <Camera className="w-6 h-6 text-gray-400 mx-auto" />
                    <span className="text-xs text-gray-400 mt-1 block">Photo</span>
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-petoo-500 text-white flex items-center justify-center shadow-md hover:bg-petoo-600 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          {/* Species selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Espèce <span className="text-petoo-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {SPECIES_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setValue("species", s.value, { shouldValidate: true })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all font-medium text-sm",
                    selectedSpecies === s.value
                      ? `bg-gradient-to-br ${s.color} shadow-sm scale-[1.02]`
                      : "border-gray-100 bg-gray-50 hover:bg-gray-100 hover:border-gray-200"
                  )}
                >
                  <span className="text-3xl">{s.emoji}</span>
                  <span className={selectedSpecies === s.value ? "text-gray-800" : "text-gray-600"}>
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
            {errors.species && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.species.message}
              </p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Nom <span className="text-petoo-500">*</span>
            </label>
            <input
              {...register("name")}
              type="text"
              placeholder="Ex: Luna, Max, Noisette…"
              className={cn(
                "w-full rounded-xl border px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-petoo-400 transition-shadow",
                errors.name ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
              )}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Breed */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Race
            </label>
            <input
              {...register("breed")}
              type="text"
              placeholder="Ex: Golden Retriever, Siamois…"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-petoo-400 transition-shadow"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Genre <span className="text-petoo-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "male", emoji: "♂️", label: "Mâle", color: "from-blue-50 to-teal-50 border-blue-300" },
                { value: "female", emoji: "♀️", label: "Femelle", color: "from-coral-50 to-lavender-50 border-coral-300" },
              ].map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setValue("gender", g.value as "male" | "female", { shouldValidate: true })}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all font-medium text-sm",
                    selectedGender === g.value
                      ? `bg-gradient-to-br ${g.color} shadow-sm`
                      : "border-gray-100 bg-gray-50 hover:bg-gray-100"
                  )}
                >
                  <span className="text-xl">{g.emoji}</span>
                  <span className="text-gray-700">{g.label}</span>
                </button>
              ))}
            </div>
            {errors.gender && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.gender.message}
              </p>
            )}
          </div>

          {/* Birth date + Weight (2 cols) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Date de naissance 🎂
              </label>
              <input
                {...register("birth_date")}
                type="date"
                max={new Date().toISOString().split("T")[0]}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-petoo-400 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Poids (kg) ⚖️
              </label>
              <input
                {...register("weight_kg")}
                type="number"
                step="0.1"
                min="0.1"
                max="199"
                placeholder="Ex: 5.2"
                className={cn(
                  "w-full rounded-xl border px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-petoo-400 transition-shadow",
                  errors.weight_kg ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
                )}
              />
              {errors.weight_kg && (
                <p className="mt-1 text-xs text-red-500">{errors.weight_kg.message as string}</p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Bio / Description 📝
            </label>
            <textarea
              {...register("bio")}
              rows={3}
              placeholder="Parlez-nous de votre compagnon… ses goûts, son caractère, ses petites manies !"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-petoo-400 transition-shadow resize-none"
            />
            <p className="text-right text-xs text-gray-400 mt-1">
              {bioValue.length}/300
            </p>
            {errors.bio && (
              <p className="text-xs text-red-500">{errors.bio.message}</p>
            )}
          </div>

          {/* Error alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 bg-teal-50 border border-teal-200 text-teal-700 text-sm px-4 py-3 rounded-xl"
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Animal ajouté avec succès ! Redirection…
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || success}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-semibold text-sm transition-all shadow-md",
              isSubmitting || success
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-petoo-500 hover:bg-petoo-600 text-white hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement…
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Enregistré !
              </>
            ) : (
              <>
                <span>🐾</span>
                Ajouter mon animal
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
