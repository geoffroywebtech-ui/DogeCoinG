import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

export const PLANS = {
  free: {
    name: "Free",
    tier: "free" as const,
    price_monthly: 0,
    price_yearly: 0,
    stripe_price_monthly: "",
    stripe_price_yearly: "",
    max_pets: 1,
    is_popular: false,
    features: [
      "1 animal",
      "Profil de base",
      "Rappels manuels",
      "Calendrier de santé",
      "Accès à la carte des pros",
    ],
  },
  premium: {
    name: "Premium",
    tier: "premium" as const,
    price_monthly: 4.99,
    price_yearly: 49.99,
    stripe_price_monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY ?? "",
    stripe_price_yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY ?? "",
    max_pets: 5,
    is_popular: true,
    features: [
      "Jusqu'à 5 animaux",
      "Rappels automatiques intelligents",
      "Journal photo/vidéo illimité",
      "Courbes de poids",
      "Alertes santé IA",
      "Compte famille partagé",
      "Programme fidélité 2×",
      "Chat direct avec les pros",
    ],
  },
  pro: {
    name: "Pro (Professionnel)",
    tier: "pro" as const,
    price_monthly: 29.99,
    price_yearly: 299.99,
    stripe_price_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
    stripe_price_yearly: process.env.STRIPE_PRICE_PRO_YEARLY ?? "",
    max_pets: 0,
    is_popular: false,
    features: [
      "Tableau de bord pro complet",
      "Gestion agenda & disponibilités",
      "Statistiques revenus & clients",
      "Portfolio photos illimité",
      "Annonce en vedette",
      "Messagerie clients intégrée",
      "Facturation automatique",
      "Badge vérifié",
    ],
  },
} as const;

export async function createOrRetrieveCustomer(
  userId: string,
  email: string,
  name: string
) {
  const { createAdminClient } = await import("@/lib/supabase/server");
  const supabase = await createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();

  if (profile?.stripe_customer_id) {
    return stripe.customers.retrieve(profile.stripe_customer_id) as Promise<Stripe.Customer>;
  }

  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { supabase_user_id: userId },
  });

  await supabase
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);

  return customer;
}

export function formatPrice(amount: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export const PLATFORM_FEE_RATE = 0.12; // 12% commission
