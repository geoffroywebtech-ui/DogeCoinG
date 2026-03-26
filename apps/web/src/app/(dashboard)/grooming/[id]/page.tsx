import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Star,
  CheckCircle2,
  Clock,
  Phone,
  Globe,
  ArrowLeft,
  Scissors,
  ChevronRight,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cn, formatCurrency, formatDate, getSpeciesEmoji, getSpeciesLabel } from "@/lib/utils";
import type { ServiceProvider, Review } from "@/types";

// ─── Star Rating ─────────────────────────────────────────────────────────────

function StarRating({
  rating,
  count,
  size = "sm",
}: {
  rating: number;
  count: number;
  size?: "sm" | "lg";
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              size === "lg" ? "w-5 h-5" : "w-4 h-4",
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            )}
          />
        ))}
      </div>
      <span className={cn("font-bold text-gray-800", size === "lg" ? "text-xl" : "text-sm")}>
        {rating.toFixed(1)}
      </span>
      <span className="text-gray-400 text-sm">({count} avis)</span>
    </div>
  );
}

// ─── Portfolio Gallery ────────────────────────────────────────────────────────

function PortfolioGallery({ photos }: { photos: string[] }) {
  if (!photos || photos.length === 0) {
    return (
      <div className="rounded-3xl bg-gradient-to-br from-petoo-50 to-lavender-50 h-64 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl">📸</span>
          <p className="mt-2 text-gray-400 text-sm">Aucune photo de portfolio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold text-gray-900">📸 Portfolio</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((photo, i) => (
          <div
            key={i}
            className={cn(
              "relative rounded-2xl overflow-hidden bg-gray-100",
              i === 0 ? "col-span-2 row-span-2 h-64 sm:h-80" : "h-32 sm:h-36"
            )}
          >
            <Image
              src={photo}
              alt={`Portfolio photo ${i + 1}`}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Services List ────────────────────────────────────────────────────────────

function ServicesList({
  services,
  providerId,
}: {
  services: ServiceProvider["services"];
  providerId: string;
}) {
  if (!services || services.length === 0) {
    return (
      <div className="bg-gray-50 rounded-2xl p-6 text-center text-gray-400">
        Aucun service renseigné pour le moment.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {services
        .filter((s) => s.is_active)
        .map((service) => (
          <div
            key={service.id}
            className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-4 hover:border-petoo-200 hover:shadow-sm transition-all"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{service.name}</span>
                <div className="flex gap-1">
                  {service.species.map((sp) => (
                    <span key={sp} className="text-sm">
                      {getSpeciesEmoji(sp)}
                    </span>
                  ))}
                </div>
              </div>
              {service.description && (
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                  {service.description}
                </p>
              )}
              <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                {service.duration_minutes} min
              </div>
            </div>
            <div className="flex items-center gap-3 ml-4">
              <span className="text-lg font-bold text-petoo-500">
                {formatCurrency(service.price)}
              </span>
              <Link
                href={`/grooming/${providerId}/book?service=${service.id}`}
                className="px-4 py-2 bg-petoo-500 text-white rounded-xl text-sm font-semibold hover:bg-petoo-600 transition-colors whitespace-nowrap"
              >
                Réserver
              </Link>
            </div>
          </div>
        ))}
    </div>
  );
}

// ─── Reviews Section ─────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-petoo-100 to-lavender-100 flex items-center justify-center">
            {review.reviewer?.avatar_url ? (
              <Image
                src={review.reviewer.avatar_url}
                alt={review.reviewer.full_name ?? "Utilisateur"}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-petoo-500" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">
              {review.reviewer?.full_name ?? "Utilisateur anonyme"}
            </p>
            <p className="text-xs text-gray-400">{formatDate(review.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "w-3.5 h-3.5",
                star <= review.rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200"
              )}
            />
          ))}
        </div>
      </div>

      {review.comment && (
        <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
      )}

      {review.response && (
        <div className="bg-petoo-50 rounded-xl p-3 border-l-4 border-petoo-400">
          <p className="text-xs font-semibold text-petoo-500 mb-1">
            ✍️ Réponse du toiletteur
          </p>
          <p className="text-sm text-gray-700">{review.response}</p>
        </div>
      )}
    </div>
  );
}

// ─── Booking CTA Panel ────────────────────────────────────────────────────────

function BookingCTAPanel({ provider }: { provider: ServiceProvider }) {
  const services = provider.services?.filter((s) => s.is_active) ?? [];
  const minPrice = services.length ? Math.min(...services.map((s) => s.price)) : null;

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6 space-y-5 sticky top-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-gray-900">Réserver une séance</h3>
        {minPrice !== null && (
          <p className="text-sm text-gray-500 mt-1">
            À partir de{" "}
            <span className="text-2xl font-extrabold text-petoo-500">
              {formatCurrency(minPrice)}
            </span>
          </p>
        )}
      </div>

      {/* Service preview */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Services proposés
        </p>
        {services.slice(0, 3).map((svc) => (
          <div key={svc.id} className="flex justify-between text-sm">
            <span className="text-gray-700">{svc.name}</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(svc.price)}
            </span>
          </div>
        ))}
        {services.length > 3 && (
          <p className="text-xs text-gray-400">+{services.length - 3} autres services</p>
        )}
      </div>

      {/* Availability hint */}
      {provider.availability && provider.availability.length > 0 && (
        <div className="bg-mint-50 rounded-xl p-3 text-xs text-gray-600">
          <p className="font-semibold text-mint-500 mb-1">🕐 Disponibilités</p>
          {provider.availability.slice(0, 2).map((a) => {
            const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
            return (
              <p key={a.id}>
                {days[a.day_of_week]} · {a.start_time} – {a.end_time}
              </p>
            );
          })}
        </div>
      )}

      {/* CTA */}
      <Link
        href={`/grooming/${provider.id}/book`}
        className="block w-full text-center py-3.5 bg-gradient-to-r from-petoo-500 to-lavender-500 text-white rounded-2xl font-bold text-base hover:opacity-90 transition-opacity shadow-md"
      >
        ✂️ Réserver maintenant
      </Link>

      {/* Trust signals */}
      <div className="border-t border-gray-100 pt-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
          Annulation gratuite 24h avant
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
          Paiement sécurisé via Stripe
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
          Commission Petoo de 12% incluse
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function GroomingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: providerRaw } = await supabase
    .from("service_providers")
    .select(
      `
      *,
      services:provider_services(*),
      availability(*),
      reviews(*, reviewer:profiles(*))
    `
    )
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (!providerRaw) notFound();

  const provider = providerRaw as unknown as ServiceProvider;
  const reviews = (provider.reviews ?? []) as Review[];

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8">
      {/* Back link */}
      <Link
        href="/grooming"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-petoo-500 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux toiletteurs
      </Link>

      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-petoo-500 via-lavender-500 to-teal-500 p-8 text-white shadow-xl">
        {/* Background portfolio photo */}
        {provider.portfolio_photos?.[0] && (
          <div className="absolute inset-0">
            <Image
              src={provider.portfolio_photos[0]}
              alt={provider.business_name}
              fill
              className="object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-petoo-600/80 via-lavender-600/60 to-teal-600/80" />
          </div>
        )}

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {/* Groomer type badge */}
              {provider.groomer_type && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm",
                    provider.groomer_type === "salon"
                      ? "bg-white/20 text-white"
                      : "bg-teal-400/30 text-white"
                  )}
                >
                  {provider.groomer_type === "salon" ? "🏪 Salon" : "🚐 Mobile"}
                </span>
              )}
              {/* Verified badge */}
              {provider.is_verified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Vérifié Petoo
                </span>
              )}
              {provider.is_featured && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-sunshine-100 text-yellow-800">
                  ⭐ En vedette
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {provider.business_name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-white/80">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-coral-300" />
                {provider.city}
                {provider.groomer_type === "mobile" && provider.travel_radius_km && (
                  <span className="text-white/60 text-sm">
                    · Déplacement {provider.travel_radius_km} km
                  </span>
                )}
              </div>
              {provider.phone && (
                <a
                  href={`tel:${provider.phone}`}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {provider.phone}
                </a>
              )}
              {provider.website && (
                <a
                  href={provider.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  Site web
                </a>
              )}
            </div>

            <StarRating
              rating={provider.rating_avg}
              count={provider.rating_count}
              size="lg"
            />

            {/* Species accepted */}
            <div className="flex flex-wrap gap-2">
              {provider.species_accepted.map((sp) => (
                <span
                  key={sp}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm"
                >
                  {getSpeciesEmoji(sp)} {getSpeciesLabel(sp)}
                </span>
              ))}
            </div>
          </div>

          {/* Quick book button (mobile) */}
          <div className="sm:hidden">
            <Link
              href={`/grooming/${provider.id}/book`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-petoo-500 rounded-2xl font-bold hover:bg-petoo-50 transition-colors shadow-lg"
            >
              <Scissors className="w-5 h-5" />
              Réserver
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-10">
          {/* Description */}
          {provider.description && (
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-gray-900">À propos</h2>
              <p className="text-gray-600 leading-relaxed">{provider.description}</p>
            </section>
          )}

          {/* Portfolio */}
          <section>
            <PortfolioGallery photos={provider.portfolio_photos ?? []} />
          </section>

          {/* Services */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">✂️ Services & Tarifs</h2>
              <span className="text-sm text-gray-400">
                {provider.services?.filter((s) => s.is_active).length ?? 0} services
              </span>
            </div>
            <ServicesList
              services={provider.services}
              providerId={provider.id}
            />
          </section>

          {/* Reviews */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                ⭐ Avis clients
              </h2>
              <StarRating
                rating={provider.rating_avg}
                count={provider.rating_count}
              />
            </div>

            {reviews.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-8 text-center">
                <span className="text-4xl">💬</span>
                <p className="mt-3 text-gray-500">
                  Aucun avis pour l&apos;instant. Soyez le premier à réserver !
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right column — sticky booking panel */}
        <div className="hidden lg:block">
          <BookingCTAPanel provider={provider} />
        </div>
      </div>

      {/* Mobile sticky footer CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-xl z-50">
        <Link
          href={`/grooming/${provider.id}/book`}
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-petoo-500 to-lavender-500 text-white rounded-2xl font-bold text-base hover:opacity-90 transition-opacity shadow-md"
        >
          ✂️ Réserver maintenant —{" "}
          {provider.services && provider.services.length > 0
            ? `à partir de ${formatCurrency(Math.min(...provider.services.filter((s) => s.is_active).map((s) => s.price)))}`
            : "Voir les tarifs"}
        </Link>
      </div>
    </div>
  );
}
