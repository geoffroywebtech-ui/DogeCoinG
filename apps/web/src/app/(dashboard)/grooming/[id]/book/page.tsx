"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Scissors,
  CalendarDays,
  PawPrint,
  CreditCard,
  FileText,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, formatCurrency, getSpeciesEmoji } from "@/lib/utils";
import type { ServiceProvider, ProviderService, Pet } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORM_FEE_RATE = 0.12;
const STEPS = [
  { id: 1, label: "Service", icon: Scissors },
  { id: 2, label: "Animal", icon: PawPrint },
  { id: 3, label: "Date & Heure", icon: CalendarDays },
  { id: 4, label: "Confirmation", icon: FileText },
  { id: 5, label: "Paiement", icon: CreditCard },
];

// ─── Schemas ──────────────────────────────────────────────────────────────────

const bookingSchema = z.object({
  service_id: z.string().min(1, "Veuillez choisir un service"),
  pet_id: z.string().min(1, "Veuillez choisir un animal"),
  date: z.string().min(1, "Veuillez choisir une date"),
  time: z.string().min(1, "Veuillez choisir un horaire"),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isCompleted
                    ? "bg-teal-500 border-teal-500 text-white"
                    : isActive
                    ? "bg-petoo-500 border-petoo-500 text-white shadow-lg shadow-petoo-200"
                    : "bg-white border-gray-200 text-gray-400"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Icon className="w-4.5 h-4.5" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-semibold hidden sm:block",
                  isActive ? "text-petoo-500" : isCompleted ? "text-teal-500" : "text-gray-400"
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "w-8 sm:w-16 h-0.5 mx-1 mb-5 transition-all duration-300",
                  currentStep > step.id ? "bg-teal-500" : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1 — Service ─────────────────────────────────────────────────────────

function StepService({
  services,
  selectedId,
  onSelect,
  isMobile,
}: {
  services: ProviderService[];
  selectedId: string;
  onSelect: (id: string) => void;
  isMobile: boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">✂️ Choisissez un service</h2>
        <p className="text-gray-500 mt-1">Sélectionnez la prestation souhaitée pour votre animal.</p>
      </div>
      <div className="space-y-3">
        {services.map((svc) => (
          <button
            key={svc.id}
            type="button"
            onClick={() => onSelect(svc.id)}
            className={cn(
              "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 text-left",
              selectedId === svc.id
                ? "border-petoo-500 bg-petoo-50 shadow-md shadow-petoo-100"
                : "border-gray-100 bg-white hover:border-petoo-200 hover:shadow-sm"
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 transition-all",
                  selectedId === svc.id
                    ? "border-petoo-500 bg-petoo-500"
                    : "border-gray-300 bg-white"
                )}
              >
                {selectedId === svc.id && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{svc.name}</p>
                {svc.description && (
                  <p className="text-sm text-gray-500 mt-0.5">{svc.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {svc.duration_minutes} min
                  </span>
                  <div className="flex gap-1">
                    {svc.species.map((sp) => (
                      <span key={sp} className="text-sm">
                        {getSpeciesEmoji(sp)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right ml-4">
              <p className="text-xl font-extrabold text-petoo-500">
                {formatCurrency(svc.price)}
              </p>
              {isMobile && (
                <p className="text-xs text-teal-500 mt-1">+ frais de dépl.</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2 — Pet ─────────────────────────────────────────────────────────────

function StepPet({
  pets,
  selectedId,
  onSelect,
}: {
  pets: Pet[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  if (pets.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">🐾 Votre animal</h2>
        <div className="text-center bg-gray-50 rounded-3xl p-10">
          <span className="text-5xl">🐕</span>
          <p className="mt-3 text-gray-600 font-semibold">Aucun animal enregistré</p>
          <p className="text-gray-400 text-sm mt-1">
            Ajoutez d&apos;abord votre compagnon dans votre espace.
          </p>
          <Link
            href="/pets/new"
            className="inline-block mt-4 px-5 py-2.5 bg-petoo-500 text-white rounded-2xl font-semibold hover:bg-petoo-600 transition-colors"
          >
            ➕ Ajouter un animal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">🐾 Pour quel animal ?</h2>
        <p className="text-gray-500 mt-1">Choisissez votre compagnon parmi vos animaux.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {pets.map((pet) => (
          <button
            key={pet.id}
            type="button"
            onClick={() => onSelect(pet.id)}
            className={cn(
              "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left",
              selectedId === pet.id
                ? "border-petoo-500 bg-petoo-50 shadow-md shadow-petoo-100"
                : "border-gray-100 bg-white hover:border-petoo-200 hover:shadow-sm"
            )}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-petoo-100 to-lavender-100 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
              {pet.avatar_url ? (
                <img
                  src={pet.avatar_url}
                  alt={pet.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                getSpeciesEmoji(pet.species)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900">{pet.name}</p>
              <p className="text-sm text-gray-500">
                {pet.breed ?? getSpeciesEmoji(pet.species)}
              </p>
              {pet.weight_kg && (
                <p className="text-xs text-gray-400 mt-0.5">{pet.weight_kg} kg</p>
              )}
            </div>
            {selectedId === pet.id && (
              <CheckCircle2 className="w-5 h-5 text-petoo-500 shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 3 — Date & Time ─────────────────────────────────────────────────────

function StepDateTime({
  register,
  errors,
}: {
  register: ReturnType<typeof useForm<BookingFormData>>["register"];
  errors: ReturnType<typeof useForm<BookingFormData>>["formState"]["errors"];
}) {
  const today = new Date().toISOString().split("T")[0];
  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">📅 Date & Heure</h2>
        <p className="text-gray-500 mt-1">Choisissez votre créneau préféré.</p>
      </div>

      {/* Date picker */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <CalendarDays className="inline w-4 h-4 mr-1 text-petoo-500" />
          Date
        </label>
        <input
          type="date"
          min={today}
          {...register("date")}
          className={cn(
            "w-full px-4 py-3 rounded-2xl border-2 text-base transition focus:outline-none focus:ring-2 focus:ring-petoo-500/30",
            errors.date
              ? "border-red-400 focus:border-red-400"
              : "border-gray-200 focus:border-petoo-400"
          )}
        />
        {errors.date && (
          <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
        )}
      </div>

      {/* Time slots */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          🕐 Heure
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {timeSlots.map((slot) => (
            <label
              key={slot}
              className="cursor-pointer"
            >
              <input
                type="radio"
                value={slot}
                {...register("time")}
                className="sr-only peer"
              />
              <div className="text-center py-2.5 rounded-xl border-2 text-sm font-medium transition-all peer-checked:border-petoo-500 peer-checked:bg-petoo-50 peer-checked:text-petoo-600 border-gray-200 hover:border-petoo-200 hover:bg-petoo-50/50">
                {slot}
              </div>
            </label>
          ))}
        </div>
        {errors.time && (
          <p className="text-red-500 text-sm mt-2">{errors.time.message}</p>
        )}
      </div>
    </div>
  );
}

// ─── Step 4 — Notes & Confirm ─────────────────────────────────────────────────

function StepConfirm({
  provider,
  selectedService,
  selectedPet,
  date,
  time,
  register,
  isMobile,
}: {
  provider: ServiceProvider;
  selectedService: ProviderService | undefined;
  selectedPet: Pet | undefined;
  date: string;
  time: string;
  register: ReturnType<typeof useForm<BookingFormData>>["register"];
  isMobile: boolean;
}) {
  const travelFee = isMobile ? (provider.travel_radius_km ? 10 : 0) : 0;
  const subtotal = selectedService?.price ?? 0;
  const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE * 100) / 100;
  const total = subtotal + travelFee + platformFee;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">📋 Récapitulatif</h2>
        <p className="text-gray-500 mt-1">Vérifiez les détails avant de confirmer.</p>
      </div>

      {/* Summary card */}
      <div className="bg-gradient-to-br from-petoo-50 to-lavender-50 rounded-3xl border border-petoo-100 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Service</p>
            <p className="font-bold text-gray-900">{selectedService?.name ?? "—"}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              {selectedService?.duration_minutes ?? "—"} min
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Animal</p>
            <p className="font-bold text-gray-900">
              {selectedPet ? `${getSpeciesEmoji(selectedPet.species)} ${selectedPet.name}` : "—"}
            </p>
            {selectedPet?.breed && (
              <p className="text-sm text-gray-500">{selectedPet.breed}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Date</p>
            <p className="font-bold text-gray-900">
              {date ? new Date(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Heure</p>
            <p className="font-bold text-gray-900">{time || "—"}</p>
          </div>
        </div>

        <div className="border-t border-petoo-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Prestation</span>
            <span className="font-semibold">
              {selectedService ? formatCurrency(selectedService.price) : "—"}
            </span>
          </div>
          {isMobile && travelFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Frais de déplacement</span>
              <span className="font-semibold">{formatCurrency(travelFee)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">
              Commission Petoo (12%)
              <span className="ml-1 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">incluse</span>
            </span>
            <span className="text-gray-500">{formatCurrency(platformFee)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t border-petoo-200 pt-2 mt-1">
            <span className="text-gray-900">Total</span>
            <span className="text-petoo-500">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          📝 Notes pour le toiletteur (optionnel)
        </label>
        <textarea
          {...register("notes")}
          rows={4}
          placeholder="Allergies, comportement particulier, demandes spécifiques…"
          className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-petoo-500/30 focus:border-petoo-400 transition"
        />
      </div>

      {/* Cancellation policy */}
      <div className="bg-mint-50 rounded-2xl p-4 text-sm text-gray-600">
        <p className="font-semibold text-mint-500 mb-1">📌 Politique d&apos;annulation</p>
        <ul className="space-y-1 text-gray-500 list-disc list-inside">
          <li>Annulation gratuite jusqu&apos;à 24h avant le rendez-vous</li>
          <li>Annulation tardive : frais de 50% du montant total</li>
          <li>En cas de no-show : 100% du montant débité</li>
        </ul>
      </div>
    </div>
  );
}

// ─── Step 5 — Payment ─────────────────────────────────────────────────────────

function StepPayment({
  total,
  isSubmitting,
  onSubmit,
}: {
  total: number;
  isSubmitting: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">💳 Paiement</h2>
        <p className="text-gray-500 mt-1">
          Vous serez redirigé vers Stripe pour finaliser votre paiement sécurisé.
        </p>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total à payer</p>
            <p className="text-3xl font-extrabold mt-1">{formatCurrency(total)}</p>
          </div>
          <div className="w-14 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <CreditCard className="w-7 h-7 text-white/70" />
          </div>
        </div>
        <div className="border-t border-white/10 pt-4 flex flex-wrap gap-3">
          {["visa", "mastercard", "amex"].map((card) => (
            <div key={card} className="bg-white/10 rounded-lg px-3 py-1.5 text-xs font-semibold text-white/70 uppercase tracking-wide">
              {card}
            </div>
          ))}
        </div>
      </div>

      {/* Security badges */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: "🔒", label: "Paiement SSL sécurisé" },
          { icon: "⚡", label: "Stripe Payments" },
          { icon: "✅", label: "Remboursement garanti" },
        ].map((badge) => (
          <div
            key={badge.label}
            className="flex flex-col items-center gap-1.5 bg-gray-50 rounded-2xl p-3 text-center"
          >
            <span className="text-2xl">{badge.icon}</span>
            <span className="text-xs font-medium text-gray-600">{badge.label}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className={cn(
          "w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-lg transition-all",
          isSubmitting
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-petoo-500 to-lavender-500 text-white hover:opacity-90 shadow-lg shadow-petoo-200"
        )}
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-gray-500 animate-spin" />
            Traitement…
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Payer {formatCurrency(total)} →
          </>
        )}
      </button>
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function BookGroomingPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialServiceId = searchParams.get("service") ?? "";

  const [step, setStep] = useState(1);
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      service_id: initialServiceId,
      pet_id: "",
      date: "",
      time: "",
      notes: "",
    },
  });

  const watchedValues = watch();
  const selectedService = provider?.services?.find(
    (s) => s.id === watchedValues.service_id
  );
  const selectedPet = pets.find((p) => p.id === watchedValues.pet_id);
  const isMobile = provider?.groomer_type === "mobile";
  const travelFee = isMobile ? 10 : 0;
  const subtotal = selectedService?.price ?? 0;
  const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE * 100) / 100;
  const total = subtotal + travelFee + platformFee;

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      const [{ data: providerData }, { data: { user } }] = await Promise.all([
        supabase
          .from("service_providers")
          .select("*, services:provider_services(*), availability(*)")
          .eq("id", params.id)
          .single(),
        supabase.auth.getUser(),
      ]);

      setProvider(providerData as unknown as ServiceProvider);

      if (user) {
        const { data: petsData } = await supabase
          .from("pets")
          .select("*")
          .eq("owner_id", user.id)
          .eq("is_active", true);
        setPets((petsData ?? []) as Pet[]);
      }

      setLoading(false);
    }
    loadData();
  }, [params.id]);

  const canAdvance = () => {
    if (step === 1) return !!watchedValues.service_id;
    if (step === 2) return !!watchedValues.pet_id;
    if (step === 3) return !!watchedValues.date && !!watchedValues.time;
    if (step === 4) return true;
    return false;
  };

  const handleNext = async () => {
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      // Step 4 → 5: create booking record then go to payment
      setStep(5);
    }
  };

  const handlePayment = async () => {
    setIsSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !selectedService) {
      setIsSubmitting(false);
      return;
    }

    const scheduledAt = new Date(
      `${watchedValues.date}T${watchedValues.time}:00`
    ).toISOString();

    // Create booking
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        client_id: user.id,
        provider_id: params.id,
        pet_id: watchedValues.pet_id,
        service_id: watchedValues.service_id,
        status: "pending",
        payment_status: "pending",
        scheduled_at: scheduledAt,
        duration_minutes: selectedService.duration_minutes,
        price_total: total,
        deposit_amount: Math.round(total * 0.3 * 100) / 100,
        travel_fee: travelFee,
        platform_fee: platformFee,
        notes: watchedValues.notes ?? null,
      })
      .select()
      .single();

    if (error || !booking) {
      setIsSubmitting(false);
      return;
    }

    // Create Stripe checkout session via API
    const res = await fetch("/api/payments/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: booking.id }),
    });

    const { url } = await res.json();
    if (url) {
      window.location.href = url;
    } else {
      router.push(`/grooming/${params.id}?booking=${booking.id}&status=pending`);
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4 animate-pulse">
        <div className="h-8 bg-gray-100 rounded-full w-1/2 mx-auto" />
        <div className="h-4 bg-gray-100 rounded-full w-2/3 mx-auto" />
        <div className="space-y-3 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <span className="text-5xl">😕</span>
        <p className="mt-4 text-gray-600 font-semibold">Prestataire introuvable.</p>
        <Link href="/grooming" className="mt-4 inline-block text-petoo-500 hover:underline">
          Retour aux toiletteurs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-16 space-y-8">
      {/* Back */}
      <Link
        href={`/grooming/${params.id}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-petoo-500 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à {provider.business_name}
      </Link>

      {/* Header */}
      <div className="bg-gradient-to-r from-petoo-500 to-lavender-500 rounded-3xl p-6 text-white">
        <p className="text-white/70 text-sm font-medium mb-1">Réservation chez</p>
        <h1 className="text-2xl font-extrabold">{provider.business_name}</h1>
        <div className="flex items-center gap-1.5 mt-2 text-white/80 text-sm">
          <MapPin className="w-3.5 h-3.5" />
          {provider.city}
          {isMobile && provider.travel_radius_km && (
            <span>· Déplacement {provider.travel_radius_km} km</span>
          )}
        </div>
      </div>

      {/* Step indicator */}
      <StepIndicator currentStep={step} />

      {/* Step content */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
        {step === 1 && (
          <StepService
            services={(provider.services ?? []).filter((s) => s.is_active)}
            selectedId={watchedValues.service_id}
            onSelect={(id) => setValue("service_id", id)}
            isMobile={isMobile}
          />
        )}
        {step === 2 && (
          <StepPet
            pets={pets}
            selectedId={watchedValues.pet_id}
            onSelect={(id) => setValue("pet_id", id)}
          />
        )}
        {step === 3 && (
          <StepDateTime register={register} errors={errors} />
        )}
        {step === 4 && (
          <StepConfirm
            provider={provider}
            selectedService={selectedService}
            selectedPet={selectedPet}
            date={watchedValues.date}
            time={watchedValues.time}
            register={register}
            isMobile={isMobile}
          />
        )}
        {step === 5 && (
          <StepPayment
            total={total}
            isSubmitting={isSubmitting}
            onSubmit={handlePayment}
          />
        )}
      </div>

      {/* Navigation buttons */}
      {step < 5 && (
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className={cn(
              "flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm transition-all",
              step === 1
                ? "opacity-0 pointer-events-none"
                : "bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300"
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Précédent
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!canAdvance()}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ml-auto",
              canAdvance()
                ? "bg-petoo-500 text-white hover:bg-petoo-600 shadow-md shadow-petoo-200"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            {step === 4 ? "Continuer vers le paiement" : "Continuer"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
