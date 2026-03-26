"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { cn, getReminderTypeLabel } from "@/lib/utils";
import {
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Bell,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Pet } from "@/types";

const reminderSchema = z.object({
  pet_id: z.string().min(1, "Choisissez un animal"),
  type: z.enum(["vaccine", "deworming", "grooming", "medication", "vet", "other"], {
    required_error: "Choisissez un type",
  }),
  title: z.string().min(1, "Le titre est requis").max(100, "Maximum 100 caractères"),
  description: z.string().max(300, "Maximum 300 caractères").optional(),
  due_date: z.string().min(1, "La date est requise"),
  repeat_interval_days: z
    .string()
    .optional()
    .transform((v: string | undefined) => (v && v !== "" ? parseInt(v, 10) : null))
    .refine((v: number | null) => v === null || (v > 0 && v <= 365), {
      message: "Entre 1 et 365 jours",
    }),
});

type ReminderFormData = z.input<typeof reminderSchema>;

const REMINDER_TYPES = [
  { value: "vaccine", emoji: "💉", label: "Vaccin", color: "border-blue-300 bg-blue-50 text-blue-700" },
  { value: "deworming", emoji: "🪱", label: "Vermifuge", color: "border-green-300 bg-green-50 text-green-700" },
  { value: "grooming", emoji: "✂️", label: "Toilettage", color: "border-purple-300 bg-purple-50 text-purple-700" },
  { value: "medication", emoji: "💊", label: "Médicament", color: "border-red-300 bg-red-50 text-red-700" },
  { value: "vet", emoji: "🏥", label: "Vétérinaire", color: "border-orange-300 bg-orange-50 text-orange-700" },
  { value: "other", emoji: "📋", label: "Autre", color: "border-gray-300 bg-gray-50 text-gray-700" },
] as const;

interface AddReminderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultPetId?: string;
  pets?: Pet[];
}

export function AddReminderForm({
  isOpen,
  onClose,
  onSuccess,
  defaultPetId,
  pets = [],
}: AddReminderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [localPets, setLocalPets] = useState<Pet[]>(pets);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      pet_id: defaultPetId ?? "",
      type: undefined,
      due_date: new Date().toISOString().split("T")[0],
    },
  });

  const selectedType = watch("type");

  // Load pets from Supabase if none passed
  useEffect(() => {
    if (pets.length > 0 || !isOpen) return;
    async function loadPets() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("pets")
        .select("id, name, species, avatar_url")
        .eq("owner_id", user.id)
        .eq("is_active", true)
        .order("name");
      if (data) setLocalPets(data as Pet[]);
    }
    loadPets();
  }, [isOpen, pets.length]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        reset();
        setError(null);
        setSuccess(false);
      }, 300);
    }
  }, [isOpen, reset]);

  async function onSubmit(data: ReminderFormData) {
    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const payload: Record<string, unknown> = {
        user_id: user.id,
        pet_id: data.pet_id,
        type: data.type,
        title: data.title,
        due_date: data.due_date,
        is_completed: false,
        notified: false,
      };
      if (data.description) payload.description = data.description;
      if (data.repeat_interval_days !== null)
        payload.repeat_interval_days = data.repeat_interval_days;

      const { error: insertError } = await supabase
        .from("reminders")
        .insert(payload);

      if (insertError) throw new Error(insertError.message);

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur s'est produite"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer / Modal */}
          <motion.div
            key="drawer"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 sm:relative sm:inset-auto sm:fixed sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg"
          >
            <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-br from-petoo-500 to-petoo-600 px-6 py-5 text-white relative">
                <div className="absolute right-6 top-3 text-5xl opacity-20 select-none">
                  🔔
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Nouveau rappel 🔔</h2>
                    <p className="text-white/75 text-sm mt-0.5">
                      Ne ratez plus aucun soin important
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                {/* Animal selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Animal <span className="text-petoo-500">*</span>
                  </label>
                  {localPets.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {localPets.map((p: Pet) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() =>
                            setValue("pet_id", p.id, { shouldValidate: true })
                          }
                          className={cn(
                            "flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all",
                            watch("pet_id") === p.id
                              ? "border-petoo-400 bg-petoo-50 text-petoo-700 shadow-sm"
                              : "border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200"
                          )}
                        >
                          {p.avatar_url ? (
                            <img
                              src={p.avatar_url}
                              alt={p.name}
                              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <span className="text-lg flex-shrink-0">
                              {p.species === "dog"
                                ? "🐕"
                                : p.species === "cat"
                                ? "🐈"
                                : "🐇"}
                            </span>
                          )}
                          <span className="truncate">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        {...register("pet_id")}
                        className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-petoo-400"
                      >
                        <option value="">Choisissez un animal</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  )}
                  {errors.pet_id && (
                    <FieldError msg={errors.pet_id.message!} />
                  )}
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type <span className="text-petoo-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {REMINDER_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() =>
                          setValue("type", t.value, { shouldValidate: true })
                        }
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition-all",
                          selectedType === t.value
                            ? t.color + " shadow-sm scale-[1.03]"
                            : "border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100"
                        )}
                      >
                        <span className="text-xl">{t.emoji}</span>
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                  {errors.type && <FieldError msg={errors.type.message!} />}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Titre <span className="text-petoo-500">*</span>
                  </label>
                  <input
                    {...register("title")}
                    type="text"
                    placeholder="Ex: Vaccin antirabique annuel…"
                    className={cn(
                      "w-full rounded-xl border px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-petoo-400 transition-shadow",
                      errors.title
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 bg-white"
                    )}
                  />
                  {errors.title && <FieldError msg={errors.title.message!} />}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    rows={2}
                    placeholder="Notes supplémentaires…"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-petoo-400 transition-shadow resize-none"
                  />
                </div>

                {/* Due date + Repeat interval */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Date 📅 <span className="text-petoo-500">*</span>
                    </label>
                    <input
                      {...register("due_date")}
                      type="date"
                      className={cn(
                        "w-full rounded-xl border px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-petoo-400 transition-shadow",
                        errors.due_date
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-white"
                      )}
                    />
                    {errors.due_date && (
                      <FieldError msg={errors.due_date.message!} />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Répéter (jours) 🔄
                    </label>
                    <input
                      {...register("repeat_interval_days")}
                      type="number"
                      min="1"
                      max="365"
                      placeholder="Ex: 30"
                      className={cn(
                        "w-full rounded-xl border px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-petoo-400 transition-shadow",
                        errors.repeat_interval_days
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-white"
                      )}
                    />
                    {errors.repeat_interval_days && (
                      <FieldError
                        msg={errors.repeat_interval_days.message as string}
                      />
                    )}
                  </div>
                </div>

                {/* Error */}
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

                {/* Success */}
                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-3 bg-teal-50 border border-teal-200 text-teal-700 text-sm px-4 py-3 rounded-xl"
                    >
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      Rappel créé avec succès !
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || success}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold transition-all shadow-md",
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
                        <Bell className="w-4 h-4" />
                        Créer le rappel
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" />
      {msg}
    </p>
  );
}
