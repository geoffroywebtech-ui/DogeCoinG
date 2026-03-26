import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { calculateAge, getSpeciesEmoji, getSpeciesLabel } from "@/lib/utils";
import { Plus, PawPrint, ArrowRight, Heart } from "lucide-react";
import type { Pet } from "@/types";

export const metadata = { title: "Mes animaux — Petoo" };

export default async function PetsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: pets } = await supabase
    .from("pets")
    .select("*")
    .eq("owner_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const speciesGradients: Record<string, string> = {
    dog: "from-sunshine-100 to-petoo-100",
    cat: "from-lavender-100 to-teal-50",
    rabbit: "from-mint-100 to-teal-100",
  };

  const speciesBorder: Record<string, string> = {
    dog: "border-sunshine-200",
    cat: "border-lavender-200",
    rabbit: "border-mint-200",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <span>🐾</span> Mes animaux
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {pets && pets.length > 0
              ? `${pets.length} animal${pets.length > 1 ? "aux" : ""} enregistré${pets.length > 1 ? "s" : ""}`
              : "Commencez par ajouter votre premier compagnon"}
          </p>
        </div>
        <Link
          href="/pets/new"
          className="inline-flex items-center gap-2 bg-petoo-500 hover:bg-petoo-600 text-white font-semibold px-5 py-2.5 rounded-2xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          Ajouter un animal
        </Link>
      </div>

      {/* Pets grid */}
      {pets && pets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pets.map((pet: Pet) => (
            <Link
              key={pet.id}
              href={`/pets/${pet.id}`}
              className={`group relative bg-white rounded-3xl border-2 ${speciesBorder[pet.species] ?? "border-gray-100"} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden`}
            >
              {/* Top gradient strip */}
              <div
                className={`h-28 bg-gradient-to-br ${speciesGradients[pet.species] ?? "from-gray-50 to-gray-100"} flex items-center justify-center relative`}
              >
                {pet.avatar_url ? (
                  <img
                    src={pet.avatar_url}
                    alt={pet.name}
                    className="w-20 h-20 object-cover rounded-full border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-white flex items-center justify-center text-4xl">
                    {getSpeciesEmoji(pet.species)}
                  </div>
                )}
                {/* Species badge */}
                <span className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full text-gray-700 border border-white/60">
                  {getSpeciesLabel(pet.species)}
                </span>
              </div>

              {/* Card body */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 group-hover:text-petoo-500 transition-colors">
                      {pet.name}
                    </h2>
                    {pet.breed && (
                      <p className="text-sm text-gray-500 mt-0.5">{pet.breed}</p>
                    )}
                  </div>
                  <span className="text-lg mt-0.5">
                    {pet.gender === "male" ? "♂️" : "♀️"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {pet.birth_date && (
                    <span className="inline-flex items-center gap-1 text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full font-medium">
                      🎂 {calculateAge(pet.birth_date)}
                    </span>
                  )}
                  {pet.weight_kg && (
                    <span className="inline-flex items-center gap-1 text-xs bg-lavender-50 text-lavender-700 px-2.5 py-1 rounded-full font-medium">
                      ⚖️ {pet.weight_kg} kg
                    </span>
                  )}
                </div>

                {pet.bio && (
                  <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed">
                    {pet.bio}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Heart className="w-3 h-3" />
                    <span>Voir le profil</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-petoo-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}

          {/* Add new pet card */}
          <Link
            href="/pets/new"
            className="group flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 hover:border-petoo-300 rounded-3xl p-10 transition-all hover:bg-petoo-50/50 min-h-[220px]"
          >
            <div className="w-14 h-14 rounded-full bg-petoo-50 group-hover:bg-petoo-100 flex items-center justify-center transition-colors">
              <Plus className="w-6 h-6 text-petoo-400 group-hover:text-petoo-500" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-500 group-hover:text-petoo-500 transition-colors text-sm">
                Ajouter un animal
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Chien, chat, lapin…</p>
            </div>
          </Link>
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="relative mb-6">
            <div className="text-8xl animate-bounce-slow select-none">🐾</div>
            <div className="absolute -top-2 -right-2 text-4xl animate-wiggle select-none">✨</div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Vos compagnons vous attendent !
          </h2>
          <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
            Ajoutez votre premier animal pour commencer à gérer sa santé, ses
            rappels et bien plus encore.
          </p>
          <div className="flex flex-wrap gap-6 justify-center mb-8 text-4xl">
            <span className="hover:scale-125 transition-transform cursor-default select-none">🐕</span>
            <span className="hover:scale-125 transition-transform cursor-default select-none">🐈</span>
            <span className="hover:scale-125 transition-transform cursor-default select-none">🐇</span>
          </div>
          <Link
            href="/pets/new"
            className="inline-flex items-center gap-2 bg-petoo-500 hover:bg-petoo-600 text-white font-semibold px-8 py-3 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Ajouter mon premier animal
          </Link>
        </div>
      )}
    </div>
  );
}
