import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Scissors, Search, SlidersHorizontal, Map, List, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cn, formatCurrency, getSpeciesEmoji, getSpeciesLabel } from "@/lib/utils";
import type { ServiceProvider } from "@/types";

// ─── Helpers ────────────────────────────────────────────────────────────────

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
      <span className="text-xs text-gray-400">({count} avis)</span>
    </div>
  );
}

function GroomerTypeBadge({ type }: { type: "salon" | "mobile" | null }) {
  if (!type) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
        type === "salon"
          ? "bg-lavender-50 text-lavender-500"
          : "bg-teal-50 text-teal-500"
      )}
    >
      {type === "salon" ? "🏪 Salon" : "🚐 Mobile"}
    </span>
  );
}

function SpeciesChip({ species }: { species: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-petoo-50 text-petoo-500 border border-petoo-100">
      {getSpeciesEmoji(species)} {getSpeciesLabel(species)}
    </span>
  );
}

function GroomerCard({ groomer }: { groomer: ServiceProvider }) {
  const minPrice = groomer.services?.length
    ? Math.min(...groomer.services.map((s) => s.price))
    : null;

  return (
    <Link href={`/grooming/${groomer.id}`} className="group block">
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        {/* Portfolio photo */}
        <div className="relative h-52 bg-gradient-to-br from-petoo-50 to-lavender-50 overflow-hidden">
          {groomer.portfolio_photos?.[0] ? (
            <Image
              src={groomer.portfolio_photos[0]}
              alt={groomer.business_name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-6xl">✂️</span>
            </div>
          )}
          {/* Badge overlay */}
          <div className="absolute top-3 left-3">
            <GroomerTypeBadge type={groomer.groomer_type} />
          </div>
          {groomer.is_verified && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-500" />
            </div>
          )}
          {groomer.is_featured && (
            <div className="absolute bottom-3 right-3 bg-sunshine-100 text-yellow-700 text-xs font-bold px-2.5 py-1 rounded-full">
              ⭐ En vedette
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-petoo-500 transition-colors">
              {groomer.business_name}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-gray-500 text-sm">
              <MapPin className="w-3.5 h-3.5 text-coral-500" />
              {groomer.city}
              {groomer.groomer_type === "mobile" && groomer.travel_radius_km && (
                <span className="text-xs text-teal-500 ml-1">
                  · {groomer.travel_radius_km} km
                </span>
              )}
            </div>
          </div>

          <StarRating rating={groomer.rating_avg} count={groomer.rating_count} />

          {/* Species */}
          <div className="flex flex-wrap gap-1.5">
            {groomer.species_accepted.map((sp) => (
              <SpeciesChip key={sp} species={sp} />
            ))}
          </div>

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
              <Scissors className="w-3.5 h-3.5" />
              Réserver
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function GroomerCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-52 bg-gray-100" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-100 rounded-full w-3/4" />
        <div className="h-4 bg-gray-100 rounded-full w-1/2" />
        <div className="h-4 bg-gray-100 rounded-full w-1/3" />
        <div className="h-9 bg-gray-100 rounded-2xl" />
      </div>
    </div>
  );
}

// ─── Filter Bar ─────────────────────────────────────────────────────────────

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

      {/* Groomer type */}
      <div className="min-w-[140px]">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          🚐 Type
        </label>
        <select
          name="type"
          defaultValue={searchParams.type ?? ""}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-petoo-500/30 focus:border-petoo-400 bg-white transition"
        >
          <option value="">Tous les types</option>
          <option value="salon">🏪 Salon</option>
          <option value="mobile">🚐 Mobile</option>
        </select>
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

// ─── Map Placeholder ────────────────────────────────────────────────────────

function MapPlaceholder({ count }: { count: number }) {
  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-teal-50 via-blue-50 to-lavender-50 border border-gray-100 shadow-sm h-[420px] flex flex-col items-center justify-center gap-4">
      <div className="absolute inset-0 opacity-10">
        {/* Decorative grid */}
        <div className="absolute inset-0 grid grid-cols-8 grid-rows-6">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="border border-teal-200" />
          ))}
        </div>
      </div>
      {/* Fake pins */}
      <div className="absolute top-[30%] left-[20%] flex flex-col items-center animate-bounce" style={{ animationDelay: "0ms" }}>
        <div className="bg-petoo-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg">✂️</div>
        <div className="w-2 h-2 bg-petoo-500 rotate-45 -mt-1" />
      </div>
      <div className="absolute top-[45%] left-[55%] flex flex-col items-center animate-bounce" style={{ animationDelay: "300ms" }}>
        <div className="bg-teal-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg">✂️</div>
        <div className="w-2 h-2 bg-teal-500 rotate-45 -mt-1" />
      </div>
      <div className="absolute top-[60%] left-[35%] flex flex-col items-center animate-bounce" style={{ animationDelay: "600ms" }}>
        <div className="bg-coral-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg">✂️</div>
        <div className="w-2 h-2 bg-coral-500 rotate-45 -mt-1" />
      </div>

      <Map className="w-16 h-16 text-teal-300 relative z-10" />
      <div className="relative z-10 text-center">
        <p className="text-gray-600 font-semibold text-lg">
          {count} toiletteur{count !== 1 ? "s" : ""} dans votre zone
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Carte interactive · Nécessite Google Maps API
        </p>
      </div>
    </div>
  );
}

// ─── View Toggle ─────────────────────────────────────────────────────────────

function ViewToggle({ view }: { view: string }) {
  return (
    <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 gap-1">
      <Link
        href="?view=list"
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
          view !== "map"
            ? "bg-petoo-500 text-white shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        <List className="w-4 h-4" />
        Liste
      </Link>
      <Link
        href="?view=map"
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
          view === "map"
            ? "bg-petoo-500 text-white shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        <Map className="w-4 h-4" />
        Carte
      </Link>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function GroomingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // Build query
  let query = supabase
    .from("service_providers")
    .select("*, services:provider_services(*)")
    .eq("service_type", "grooming")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("rating_avg", { ascending: false });

  if (params.city) {
    query = query.ilike("city", `%${params.city}%`);
  }
  if (params.type === "salon" || params.type === "mobile") {
    query = query.eq("groomer_type", params.type);
  }
  if (params.species) {
    query = query.contains("species_accepted", [params.species]);
  }

  const { data: groomers } = await query.limit(24);

  const allGroomers = (groomers ?? []) as ServiceProvider[];

  // Client-side max price filter (done in JS since price is on services table)
  const maxPrice = params.maxPrice ? parseInt(params.maxPrice) : null;
  const filteredGroomers = maxPrice
    ? allGroomers.filter((g) =>
        g.services?.some((s) => s.price <= maxPrice)
      )
    : allGroomers;

  const view = params.view ?? "list";

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-petoo-500 via-lavender-500 to-teal-500 p-8 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-8 text-8xl">✂️</div>
          <div className="absolute bottom-4 right-32 text-5xl">🐩</div>
          <div className="absolute top-6 left-1/2 text-4xl">🛁</div>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Toiletteurs &amp; Grooming ✂️
          </h1>
          <p className="mt-2 text-white/80 text-base max-w-xl">
            Trouvez le meilleur toiletteur pour votre compagnon — salon ou à domicile.
            Réservez en quelques clics, payez en toute sécurité.
          </p>
          <div className="mt-4 flex items-center gap-3 text-sm text-white/70">
            <span>🏅 {filteredGroomers.length} toiletteurs disponibles</span>
            <span>·</span>
            <span>✅ Tous vérifiés par Petoo</span>
            <span>·</span>
            <span>🔒 Paiement sécurisé</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar searchParams={params} />

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{filteredGroomers.length}</span>{" "}
          toiletteur{filteredGroomers.length !== 1 ? "s" : ""} trouvé{filteredGroomers.length !== 1 ? "s" : ""}
        </p>
        <ViewToggle view={view} />
      </div>

      {/* Content */}
      {view === "map" ? (
        <MapPlaceholder count={filteredGroomers.length} />
      ) : (
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <GroomerCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          {filteredGroomers.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-700">Aucun résultat</h3>
              <p className="text-gray-400 mt-2">
                Essayez d&apos;élargir vos critères de recherche.
              </p>
              <Link
                href="/grooming"
                className="inline-block mt-5 px-6 py-3 bg-petoo-500 text-white rounded-2xl font-semibold hover:bg-petoo-600 transition"
              >
                Réinitialiser les filtres
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGroomers.map((groomer) => (
                <GroomerCard key={groomer.id} groomer={groomer} />
              ))}
            </div>
          )}
        </Suspense>
      )}
    </div>
  );
}
