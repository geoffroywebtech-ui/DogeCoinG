import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const serviceType = searchParams.get("service_type");
  const city = searchParams.get("city");
  const groomerType = searchParams.get("groomer_type");
  const species = searchParams.get("species");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radiusKm = parseFloat(searchParams.get("radius") ?? "30");

  let query = supabase
    .from("service_providers")
    .select(`
      *,
      provider_services (id, name, price, duration_minutes, species),
      reviews (rating, comment, created_at)
    `)
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("rating_avg", { ascending: false })
    .limit(50);

  if (serviceType) query = query.eq("service_type", serviceType);
  if (city) query = query.ilike("city", `%${city}%`);
  if (groomerType) query = query.eq("groomer_type", groomerType);
  if (species) query = query.contains("species_accepted", [species]);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Filter by distance if coordinates provided
  let providers = data ?? [];
  if (lat && lng) {
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    providers = providers.filter((p) => {
      if (!p.latitude || !p.longitude) return true; // include if no coords
      const dist = getDistanceKm(userLat, userLng, p.latitude, p.longitude);
      return dist <= radiusKm;
    });
  }

  return NextResponse.json({ providers });
}

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number) { return (deg * Math.PI) / 180; }
