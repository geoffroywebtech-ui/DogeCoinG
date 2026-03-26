import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

const COLORS = { primary: "#ff5a0d", teal: "#14b8a6", lavender: "#8b5cf6", coral: "#f43f5e", bg: "#f9fafb" };

const SERVICE_TYPES = [
  { type: "grooming", emoji: "✂️", label: "Toilettage", color: COLORS.lavender },
  { type: "vet",      emoji: "🏥", label: "Vétérinaire", color: COLORS.teal },
  { type: "petsitting", emoji: "🏠", label: "Garde", color: COLORS.primary },
  { type: "dogwalking", emoji: "🦮", label: "Promenade", color: "#10b981" },
];

export default function ServicesScreen() {
  const [activeType, setActiveType] = useState("grooming");
  const [city, setCity] = useState("");
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchProviders = async () => {
    setLoading(true);
    let query = supabase
      .from("service_providers")
      .select("*, provider_services(name, price)")
      .eq("service_type", activeType)
      .eq("is_active", true)
      .order("rating_avg", { ascending: false })
      .limit(20);

    if (city) query = query.ilike("city", `%${city}%`);
    const { data } = await query;
    setProviders(data ?? []);
    setLoading(false);
  };

  useEffect(() => { searchProviders(); }, [activeType]);

  const handleEmergencyVet = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Localisation requise", "Activez la localisation pour trouver un vétérinaire d'urgence.");
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    Alert.alert(
      "🏥 Urgence vétérinaire",
      `Recherche des vétérinaires ouverts près de vous...\n\nLocalisation: ${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`,
      [
        { text: "Appeler le 3115 (urgences)", onPress: () => {} },
        { text: "Chercher sur la carte", onPress: () => {} },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Emergency button */}
        <TouchableOpacity style={styles.emergencyBtn} onPress={handleEmergencyVet}>
          <Text style={{ fontSize: 24 }}>🚨</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.emergencyTitle}>Urgence vétérinaire</Text>
            <Text style={styles.emergencySub}>Trouver un vétérinaire ouvert maintenant</Text>
          </View>
          <Text style={{ color: "#fff", fontWeight: "700" }}>→</Text>
        </TouchableOpacity>

        {/* Service type selector */}
        <View style={styles.typeRow}>
          {SERVICE_TYPES.map((t) => (
            <TouchableOpacity
              key={t.type}
              style={[styles.typeBtn, activeType === t.type && { borderColor: t.color, backgroundColor: `${t.color}15` }]}
              onPress={() => setActiveType(t.type)}
            >
              <Text style={{ fontSize: 22 }}>{t.emoji}</Text>
              <Text style={[styles.typeLabel, activeType === t.type && { color: t.color }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="Ville (ex: Paris, Lyon...)"
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={searchProviders}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={searchProviders}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Providers list */}
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <Text style={styles.sectionTitle}>
            {providers.length} résultat{providers.length !== 1 ? "s" : ""}
          </Text>
          {providers.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={styles.providerCard}
              onPress={() => router.push(`/services/${p.id}` as any)}
            >
              <View style={styles.providerHeader}>
                <View style={styles.providerAvatar}>
                  <Text style={{ fontSize: 24 }}>
                    {p.service_type === "grooming" ? "✂️" : p.service_type === "vet" ? "🏥" : p.service_type === "petsitting" ? "🏠" : "🦮"}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={styles.providerName}>{p.business_name}</Text>
                    {p.is_verified && <Text style={{ fontSize: 12 }}>✅</Text>}
                    {p.is_featured && <Text style={{ fontSize: 12, color: "#eab308" }}>⭐</Text>}
                  </View>
                  <Text style={styles.providerCity}>📍 {p.city}</Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>⭐ {p.rating_avg?.toFixed(1) ?? "–"}</Text>
                  <Text style={styles.ratingCount}>({p.rating_count})</Text>
                </View>
              </View>
              {p.provider_services?.length > 0 && (
                <View style={styles.servicesRow}>
                  {p.provider_services.slice(0, 3).map((s: any) => (
                    <View key={s.id} style={styles.serviceChip}>
                      <Text style={styles.serviceChipText}>{s.name} · {s.price}€</Text>
                    </View>
                  ))}
                </View>
              )}
              <TouchableOpacity
                style={styles.bookBtn}
                onPress={() => router.push(`/services/${p.id}/book` as any)}
              >
                <Text style={styles.bookBtnText}>Réserver →</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          {!loading && providers.length === 0 && (
            <View style={styles.emptyBox}>
              <Text style={{ fontSize: 40 }}>🔍</Text>
              <Text style={styles.emptyText}>Aucun résultat</Text>
              <Text style={styles.emptySubText}>Essayez une autre ville ou un autre service</Text>
            </View>
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  emergencyBtn: { margin: 16, backgroundColor: "#dc2626", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center" },
  emergencyTitle: { color: "#fff", fontWeight: "700", fontSize: 15 },
  emergencySub: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },
  typeRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  typeBtn: { flex: 1, alignItems: "center", backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 14, padding: 10, gap: 4 },
  typeLabel: { fontSize: 10, fontWeight: "600", color: "#6b7280" },
  searchRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  searchInput: { flex: 1, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  searchBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 16, justifyContent: "center" },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "#6b7280", marginBottom: 12 },
  providerCard: { backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#f3f4f6" },
  providerHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  providerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center" },
  providerName: { fontSize: 14, fontWeight: "700", color: "#111827" },
  providerCity: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  ratingBadge: { alignItems: "flex-end" },
  ratingText: { fontSize: 13, fontWeight: "700", color: "#111827" },
  ratingCount: { fontSize: 10, color: "#9ca3af" },
  servicesRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  serviceChip: { backgroundColor: "#f3f4f6", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  serviceChipText: { fontSize: 11, color: "#374151", fontWeight: "500" },
  bookBtn: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 12, alignItems: "center" },
  bookBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  emptyBox: { alignItems: "center", padding: 40, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: "700", color: "#111827" },
  emptySubText: { fontSize: 13, color: "#6b7280" },
});
