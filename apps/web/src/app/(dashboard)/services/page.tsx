import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Star,
  CheckCircle2,
  Phone,
  AlertCircle,
  Search,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  cn,
  formatCurrency,
  getServiceEmoji,
  getServiceLabel,
  getSpeciesEmoji,
  getSpeciesLabel,
} from "@/lib/utils";
import type { ServiceProvider, ServiceType } from "@/types";

// ─── Service Category Config ──────────────────────────────────────────────────

const SERVICE_CATEGORIES = [
  {
    type: "vet" as ServiceType,
    emoji: "🏥",
    label: "Vétérinaires",
    description: "Consultations, vaccins, urgences",
    color: "from-blue-400 to-blue-600",
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
  },
  {
    type: "petsitting" as ServiceType,
    emoji: "🏠",
    label: "Garde d'animaux",
    description: "Pet-sitters à domicile ou chez eux",
    color: "from-teal-400 to-teal-600",
    bg: "bg-teal-50",
    text: "text-teal-600",
    border: "border-teal-200",
  },
  {
    type: "dogwalking" as ServiceType,
    emoji: "🦮",
    label: "Promenade",
    description: "Dog walkers professionnels",
    color: "from-orange-400 to-orange-600",
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-200",
  },
  {
    type: "grooming" as ServiceType,
    emoji: "✂️",
    label: "Toilettage",
    description: "Salons et toiletteurs mobiles",
    color: "from-petoo-400 to-lavender-500",
    bg: "bg-petoo-50",
    text: "text-petoo-600",
    border: "border-petoo-200",
  },
];

// ─── Components ───────────────────────────────────────────────────────────────

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "w-3.5 h-3.5",
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            )}
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-gray-700">{rating.toFixed(1)}</span>
      <span className="text-xs text-gray-400">({count})</span>
    </div>
  );
}

function ServiceBadge({ type }: { type: ServiceType }) {
  const cat = SERVICE_CATEGORIES.find((c) => c.type === type);
  if (!cat) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
        cat.bg,
        cat.text,
        cat.border
      )}
    >
      {cat.emoji} {cat.label}
    </span>
  );
}

function ProviderCard({ provider }: { provider: ServiceProvider }) {
  const minPrice = provider.services?.length
    ? Math.min(...provider.services.map((s) => s.price))
    : null;

  const href =
    provider.service_type === "grooming"
      ? `/grooming/${provider.id}`
      : `/services/${provider.id}`;

  return (
    <Link href={href} className="group block">
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        {/* Photo */}
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {provider.portfolio_photos?.[0] ? (
            <Image
              src={provider.portfolio_photos[0]}
              alt={provider.business_name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-5xl">{getServiceEmoji(provider.service_type)}</span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <ServiceBadge type={provider.service_type} />
          </div>
          {provider.is_verified && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow">
              <CheckCircle2 className="w-4 h-4 text-teal-500" />
            </div>
          )}
          {provider.is_featured && (
            <div className="absolute bottom-3 right-3 bg-sunshine-100 text-yellow-700 text-xs font-bold px-2.5 py-1 rounded-full shadow">
              ⭐ En vedette
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-petoo-500 transition-colors">
              {provider.business_name}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-gray-500 text-sm">
              <MapPin className="w-3.5 h-3.5 text-coral-500" />
              {provider.city}
            </div>
          </div>

          <StarRating rating={provider.rating_avg} count={provider.rating_count} />

          {/* Species */}
          {provider.species_accepted.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {provider.species_accepted.map((sp) => (
                <span
                  key={sp}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-petoo-50 text-petoo-500 border border-petoo-100"
                >
                  {getSpeciesEmoji(sp)} {getSpeciesLabel(sp)}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            {minPrice !== null ? (
              <div className="text-sm text-gray-500">
                À partir de{" "}
                <span className="font-bold text-gray-900 text-base">
                  {formatCurrency(minPrice)}
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-400">Sur devis</span>
            )}
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-petoo-500 text-white rounded-2xl text-sm font-semibold hover:bg-petoo-600 transition-colors">
              {getServiceEmoji(provider.service_type)} Réserver
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ProviderCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-48 bg-gray-100" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-100 rounded-full w-3/4" />
        <div className="h-4 bg-gray-100 rounded-full w-1/2" />
        <div className="h-4 bg-gray-100 rounded-full w-1/3" />
        <div className="h-9 bg-gray-100 rounded-2xl" />
      </div>
    </div>
  );
}

// ─── Category Cards ───────────────────────────────────────────────────────────

function CategoryCards({
  counts,
  activeType,
}: {
  counts: Record<string, number>;
  activeType: string;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {SERVICE_CATEGORIES.map((cat) => {
        const isActive = activeType === cat.type;
        const href = isActive ? "/services" : `/services?type=${cat.type}`;
        return (
          <Link
            key={cat.type}
            href={href}
            className={cn(
              "relative overflow-hidden rounded-3xl p-5 border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
              isActive
                ? "border-transparent shadow-lg scale-[1.02]"
                : "border-gray-100 bg-white hover:border-gray-200"
            )}
          >
            {isActive && (
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", cat.color)} />
            )}
            <div className="relative z-10">
              <span className="text-3xl block mb-2">{cat.emoji}</span>
              <p
                className={cn(
                  "font-bold text-sm",
                  isActive ? "text-white" : "text-gray-900"
                )}
              >
                {cat.label}
              </p>
              <p
                className={cn(
                  "text-xs mt-0.5",
                  isActive ? "text-white/80" : "text-gray-500"
                )}
              >
                {cat.description}
              </p>
              {counts[cat.type] !== undefined && (
                <span
                  className={cn(
                    "inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full",
                    isActive
                      ? "bg-white/20 text-white"
                      : cn(cat.bg, cat.text)
                  )}
                >
                  {counts[cat.type]} disponibles
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

function FilterBar({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  return (
    <form
      method="GET"
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-end"
    >
      {/* Keep current type */}
      {searchParams.type && (
        <input type="hidden" name="type" value={searchParams.type} />
      )}

      {/* City */}
      <div className="flex-1 min-w-[160px]">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          🏙️ Ville
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            name="city"
            defaultValue={searchParams.city ?? ""}
            placeholder="Paris, Lyon…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-petoo-500/30 focus:border-petoo-400 transition"
          />
        </div>
      </div>

      {/* Species */}
      <div className="min-w-[140px]">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          🐾 Animal
        </label>
        <select
          name="species"
          defaultValue={searchParams.species ?? ""}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-petoo-500/30 focus:border-petoo-400 bg-white transition"
        >
          <option value="">Tous les animaux</option>
          <option value="dog">🐕 Chien</option>
          <option value="cat">🐈 Chat</option>
          <option value="rabbit">🐇 Lapin</option>
        </select>
      </div>

      {/* Max price */}
      <div className="min-w-[140px]">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          💶 Budget max
        </label>
        <select
          name="maxPrice"
          defaultValue={searchParams.maxPrice ?? ""}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-petoo-500/30 focus:border-petoo-400 bg-white transition"
        >
          <option value="">Pas de limite</option>
          <option value="30">Jusqu&apos;à 30 €</option>
          <option value="50">Jusqu&apos;à 50 €</option>
          <option value="80">Jusqu&apos;à 80 €</option>
          <option value="120">Jusqu&apos;à 120 €</option>
        </select>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="flex items-center gap-2 px-5 py-2.5 bg-petoo-500 text-white rounded-xl text-sm font-semibold hover:bg-petoo-600 transition-colors shadow-sm"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filtrer
      </button>
    </form>
  );
}

// ─── Emergency Vet Button ─────────────────────────────────────────────────────

function EmergencyVetButton() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-500 to-red-600 p-6 text-white shadow-xl">
      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 text-8xl">
        🚨
      </div>
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-5 h-5 text-red-200" />
            <span className="text-red-100 text-sm font-semibold uppercase tracking-wide">
              URGENCE
            </span>
          </div>
          <h2 className="text-2xl font-extrabold">
            Votre animal a besoin de soins urgents ?
          </h2>
          <p className="text-red-100 text-sm mt-1">
            Trouvez une clinique vétérinaire d&apos;urgence ouverte 24h/24 près de chez vous.
          </p>
        </div>
        <a
          href="tel:3115"
          className="shrink-0 flex items-center gap-2.5 px-6 py-4 bg-white text-red-600 rounded-2xl font-bold text-base hover:bg-red-50 transition-colors shadow-lg whitespace-nowrap"
        >
          <Phone className="w-5 h-5" />
          Trouver un vétérinaire urgent ☎️
        </a>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // Build the providers query
  let query = supabase
    .from("service_providers")
    .select("*, services:provider_services(*)")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("rating_avg", { ascending: false });

  // Filter by service type
  const serviceType = params.type as ServiceType | undefined;
  if (serviceType) {
    query = query.eq("service_type", serviceType);
  }
  if (params.city) {
    query = query.ilike("city", `%${params.city}%`);
  }
  if (params.species) {
    query = query.contains("species_accepted", [params.species]);
  }

  const { data: providers } = await query.limit(36);
  const allProviders = (providers ?? []) as ServiceProvider[];

  // Price filter (client-side on services)
  const maxPrice = params.maxPrice ? parseInt(params.maxPrice) : null;
  const filteredProviders = maxPrice
    ? allProviders.filter((p) => p.services?.some((s) => s.price <= maxPrice))
    : allProviders;

  // Count per category (separate lightweight query)
  const { data: countData } = await supabase
    .from("service_providers")
    .select("service_type")
    .eq("is_active", true);

  const counts = (countData ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.service_type] = (acc[row.service_type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-500 via-petoo-500 to-lavender-500 p-8 text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-3 right-8 text-7xl">🐾</div>
          <div className="absolute bottom-3 right-32 text-5xl">🏥</div>
          <div className="absolute top-6 left-1/2 text-4xl">🦮</div>
          <div className="absolute bottom-4 left-1/3 text-3xl">🏠</div>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Services pour animaux 🐾
          </h1>
          <p className="mt-2 text-white/80 text-base max-w-xl">
            Vétérinaires, pet-sitters, dog walkers, toiletteurs… Tous les services
            dont votre compagnon a besoin, en un seul endroit.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/70">
            <span>🏅 {Object.values(counts).reduce((a, b) => a + b, 0)} prestataires</span>
            <span>·</span>
            <span>✅ Tous vérifiés par Petoo</span>
            <span>·</span>
            <span>🔒 Paiement sécurisé</span>
          </div>
        </div>
      </div>

      {/* Emergency vet button — shown always */}
      <EmergencyVetButton />

      {/* Category cards */}
      <CategoryCards counts={counts} activeType={serviceType ?? ""} />

      {/* Filters */}
      <FilterBar searchParams={params} />

      {/* Results header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{filteredProviders.length}</span>{" "}
          prestataire{filteredProviders.length !== 1 ? "s" : ""} trouvé
          {filteredProviders.length !== 1 ? "s" : ""}
          {serviceType && (
            <>
              {" "}
              pour{" "}
              <span className="font-semibold text-gray-700">
                {getServiceEmoji(serviceType)} {getServiceLabel(serviceType)}
              </span>
            </>
          )}
        </p>
        {serviceType && (
          <Link
            href="/services"
            className="text-sm text-petoo-500 hover:text-petoo-600 font-medium flex items-center gap-1"
          >
            Voir tous les services
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Providers grid */}
      {filteredProviders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-gray-700">Aucun résultat</h3>
          <p className="text-gray-400 mt-2">
            Essayez d&apos;élargir vos critères de recherche.
          </p>
          <Link
            href="/services"
            className="inline-block mt-5 px-6 py-3 bg-petoo-500 text-white rounded-2xl font-semibold hover:bg-petoo-600 transition"
          >
            Réinitialiser les filtres
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProviders.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}
    </div>
  );
}
