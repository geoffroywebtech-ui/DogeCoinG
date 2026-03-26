import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert("Erreur", "Remplissez tous les champs."); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert("Erreur de connexion", "Email ou mot de passe incorrect.");
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff5f0" }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text style={styles.logo}>🐾</Text>
          <Text style={styles.title}>Bon retour !</Text>
          <Text style={styles.subtitle}>Connectez-vous à votre compte Petoo</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email} onChangeText={setEmail}
              placeholder="votre@email.fr"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <Text style={[styles.label, { marginTop: 14 }]}>Mot de passe</Text>
            <View style={{ position: "relative" }}>
              <TextInput
                value={password} onChangeText={setPassword}
                secureTextEntry={!showPwd}
                placeholder="Votre mot de passe"
                style={styles.input}
              />
            </View>
            <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password" as any)}>
              <Text style={styles.forgotLink}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, loading && { opacity: 0.6 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.btnText}>{loading ? "Connexion…" : "Se connecter"}</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Pas encore de compte ? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register" as any)}>
                <Text style={styles.footerLink}>S'inscrire gratuitement</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  logo: { fontSize: 64, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: "700", color: "#111827", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#6b7280", marginBottom: 32 },
  card: { width: "100%", backgroundColor: "#fff", borderRadius: 24, padding: 24, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
  input: { backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: "#111827" },
  forgotLink: { color: "#ff5a0d", fontSize: 12, fontWeight: "600", textAlign: "right", marginTop: 8, marginBottom: 20 },
  btn: { backgroundColor: "#ff5a0d", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { fontSize: 13, color: "#6b7280" },
  footerLink: { fontSize: 13, color: "#ff5a0d", fontWeight: "700" },
});
