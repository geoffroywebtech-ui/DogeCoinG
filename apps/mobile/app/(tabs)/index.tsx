import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

const COLORS = {
  primary: "#ff5a0d",
  teal: "#14b8a6",
  lavender: "#8b5cf6",
  sunshine: "#eab308",
  coral: "#f43f5e",
  bg: "#f9fafb",
  white: "#ffffff",
  text: "#111827",
  muted: "#6b7280",
};

export default function HomeScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/(auth)/login"); return; }

    const [{ data: p }, { data: pets }, { data: rems }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("pets").select("*").eq("owner_id", user.id).eq("is_active", true).limit(5),
      supabase.from("reminders").select("*, pets(name)").eq("user_id", user.id).eq("is_completed", false).order("due_date").limit(3),
    ]);

    setProfile(p);
    setPets(pets ?? []);
    setReminders(rems ?? []);
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const getSpeciesEmoji = (species: string) =>
    species === "dog" ? "🐕" : species === "cat" ? "🐈" : "🐇";

  const firstName = profile?.full_name?.split(" ")[0] ?? "là";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: COLORS.primary }]}>
          <View>
            <Text style={styles.welcomeText}>Bonjour {firstName} 👋</Text>
            <Text style={styles.welcomeSub}>
              {pets.length > 0 ? `${pets.length} animal${pets.length > 1 ? "aux" : ""} enregistré${pets.length > 1 ? "s" : ""}` : "Ajoutez votre premier animal !"}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/settings")} style={styles.avatarBtn}>
            <Text style={{ fontSize: 24 }}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Quick actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActions}>
            {[
              { icon: "➕", label: "Ajouter animal", route: "/pets/new", color: COLORS.primary },
              { icon: "✂️", label: "Toiletteur", route: "/services", color: COLORS.lavender },
              { icon: "🏥", label: "Urgence Vet", route: "/services/emergency", color: COLORS.coral },
              { icon: "📅", label: "Rappel", route: "/calendar/new", color: COLORS.teal },
            ].map((a) => (
              <TouchableOpacity
                key={a.label}
                style={[styles.quickBtn, { borderColor: a.color }]}
                onPress={() => router.push(a.route as any)}
              >
                <Text style={{ fontSize: 24 }}>{a.icon}</Text>
                <Text style={[styles.quickLabel, { color: a.color }]}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* My pets */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes animaux 🐾</Text>
            <TouchableOpacity onPress={() => router.push("/pets")}>
              <Text style={{ color: COLORS.primary, fontWeight: "600", fontSize: 13 }}>Voir tous</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {pets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={styles.petCard}
                onPress={() => router.push(`/pets/${pet.id}` as any)}
              >
                <View style={styles.petAvatarCircle}>
                  <Text style={{ fontSize: 32 }}>{getSpeciesEmoji(pet.species)}</Text>
                </View>
                <Text style={styles.petName}>{pet.name}</Text>
                <Text style={styles.petBreed}>{pet.breed ?? pet.species}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.petCard, styles.petCardAdd]}
              onPress={() => router.push("/pets/new" as any)}
            >
              <View style={[styles.petAvatarCircle, { backgroundColor: "#f3f4f6" }]}>
                <Text style={{ fontSize: 28 }}>➕</Text>
              </View>
              <Text style={[styles.petName, { color: COLORS.primary }]}>Ajouter</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Upcoming reminders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Prochains rappels ⏰</Text>
            <TouchableOpacity onPress={() => router.push("/calendar")}>
              <Text style={{ color: COLORS.primary, fontWeight: "600", fontSize: 13 }}>Voir tous</Text>
            </TouchableOpacity>
          </View>
          {reminders.length > 0 ? (
            reminders.map((r) => (
              <View key={r.id} style={styles.reminderCard}>
                <Text style={{ fontSize: 20, marginRight: 10 }}>
                  {r.type === "vaccine" ? "💉" : r.type === "deworming" ? "💊" : r.type === "grooming" ? "✂️" : "🏥"}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reminderTitle}>{r.title}</Text>
                  <Text style={styles.reminderSub}>{r.pets?.name} · {new Date(r.due_date).toLocaleDateString("fr-FR")}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyBox}>
              <Text style={{ fontSize: 32 }}>✅</Text>
              <Text style={styles.emptyText}>Aucun rappel en attente</Text>
            </View>
          )}
        </View>

        {/* Loyalty points */}
        <View style={[styles.loyaltyCard, { backgroundColor: COLORS.sunshine }]}>
          <Text style={{ fontSize: 24 }}>⭐</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.loyaltyPts}>{profile?.loyalty_points ?? 0} points fidélité</Text>
            <Text style={styles.loyaltySub}>Gagnez des points à chaque réservation</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/rewards")}>
            <Ionicons name="chevron-forward" size={20} color="#92400e" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 24, paddingTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  welcomeText: { fontSize: 22, fontWeight: "700", color: "#fff" },
  welcomeSub: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  avatarBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#111827", marginBottom: 12 },
  quickActions: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  quickBtn: { flex: 1, minWidth: "45%", alignItems: "center", backgroundColor: "#fff", borderWidth: 1.5, borderRadius: 16, padding: 14, gap: 6 },
  quickLabel: { fontSize: 11, fontWeight: "600", textAlign: "center" },
  petCard: { alignItems: "center", backgroundColor: "#fff", borderRadius: 16, padding: 14, marginRight: 12, width: 100, borderWidth: 1, borderColor: "#f3f4f6" },
  petCardAdd: { borderStyle: "dashed" },
  petAvatarCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#fff5f0", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  petName: { fontSize: 13, fontWeight: "700", color: "#111827", textAlign: "center" },
  petBreed: { fontSize: 11, color: "#6b7280", textAlign: "center", marginTop: 2 },
  reminderCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#f3f4f6" },
  reminderTitle: { fontSize: 13, fontWeight: "600", color: "#111827" },
  reminderSub: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  emptyBox: { alignItems: "center", backgroundColor: "#fff", borderRadius: 14, padding: 24, gap: 8 },
  emptyText: { fontSize: 13, color: "#6b7280" },
  loyaltyCard: { margin: 16, borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center" },
  loyaltyPts: { fontSize: 15, fontWeight: "700", color: "#92400e" },
  loyaltySub: { fontSize: 11, color: "#92400e", marginTop: 2, opacity: 0.8 },
});
