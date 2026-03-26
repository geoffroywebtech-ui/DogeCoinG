import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isTomorrow } from "date-fns";
import { fr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = "d MMMM yyyy") {
  return format(new Date(date), fmt, { locale: fr });
}

export function formatRelative(date: string | Date) {
  const d = new Date(date);
  if (isToday(d)) return "Aujourd'hui";
  if (isTomorrow(d)) return "Demain";
  return formatDistanceToNow(d, { addSuffix: true, locale: fr });
}

export function getSpeciesEmoji(species: string) {
  const map: Record<string, string> = {
    dog: "🐕",
    cat: "🐈",
    rabbit: "🐇",
  };
  return map[species] ?? "🐾";
}

export function getSpeciesLabel(species: string) {
  const map: Record<string, string> = {
    dog: "Chien",
    cat: "Chat",
    rabbit: "Lapin",
  };
  return map[species] ?? species;
}

export function getServiceLabel(type: string) {
  const map: Record<string, string> = {
    grooming: "Toilettage",
    vet: "Vétérinaire",
    petsitting: "Garde d'animal",
    dogwalking: "Promenade",
  };
  return map[type] ?? type;
}

export function getServiceEmoji(type: string) {
  const map: Record<string, string> = {
    grooming: "✂️",
    vet: "🏥",
    petsitting: "🏠",
    dogwalking: "🦮",
  };
  return map[type] ?? "🐾";
}

export function calculateAge(birthDate: string) {
  const birth = new Date(birthDate);
  const now = new Date();
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    now.getMonth() -
    birth.getMonth();
  if (months < 12) return `${months} mois`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years} ans et ${rem} mois` : `${years} ans`;
}

export function truncate(str: string, len = 80) {
  return str.length > len ? str.slice(0, len) + "…" : str;
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[àáâ]/g, "a")
    .replace(/[éèêë]/g, "e")
    .replace(/[îï]/g, "i")
    .replace(/[ôö]/g, "o")
    .replace(/[ùûü]/g, "u")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function getReminderTypeLabel(type: string) {
  const map: Record<string, string> = {
    vaccine: "Vaccin",
    deworming: "Vermifuge",
    grooming: "Toilettage",
    medication: "Médicament",
    vet: "Vétérinaire",
    other: "Autre",
  };
  return map[type] ?? type;
}

export function getReminderTypeColor(type: string) {
  const map: Record<string, string> = {
    vaccine: "bg-blue-100 text-blue-700",
    deworming: "bg-green-100 text-green-700",
    grooming: "bg-purple-100 text-purple-700",
    medication: "bg-red-100 text-red-700",
    vet: "bg-orange-100 text-orange-700",
    other: "bg-gray-100 text-gray-700",
  };
  return map[type] ?? "bg-gray-100 text-gray-700";
}
