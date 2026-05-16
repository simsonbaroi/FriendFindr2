import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Alert,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { InputField } from "@/components/InputField";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function SignupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signup } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const clearError = (field: string) =>
    setErrors((e) => { const n = { ...e }; delete n[field]; return n; });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!displayName.trim()) e.displayName = "Name is required";
    if (!username.trim()) e.username = "Username is required";
    else if (!/^[a-zA-Z0-9_]{3,20}$/.test(username))
      e.username = "3-20 chars: letters, numbers, underscores";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "At least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signup(email.trim(), password, displayName.trim(), username.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg =
        err.code === "auth/email-already-in-use"
          ? "An account with this email already exists."
          : err.code === "auth/weak-password"
          ? "Password is too weak."
          : err.message ?? "Signup failed. Please try again.";
      Alert.alert("Create account failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBar} />

      <LinearGradient
        colors={["#0A1628", "#0F2040", colors.background]}
        style={[styles.heroBg, { paddingTop: topPad + 16 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
        <Text style={styles.heroTitle}>Create account</Text>
        <Text style={styles.heroSub}>Join FriendFindr today</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.fields}>
              <InputField
                label="Display Name"
                placeholder="Your full name"
                value={displayName}
                onChangeText={(t) => { setDisplayName(t); clearError("displayName"); }}
                leftIcon="user"
                error={errors.displayName}
              />
              <InputField
                label="Username"
                placeholder="e.g. john_doe"
                value={username}
                onChangeText={(t) => { setUsername(t.toLowerCase()); clearError("username"); }}
                leftIcon="at-sign"
                autoCapitalize="none"
                error={errors.username}
              />
              <InputField
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={(t) => { setEmail(t); clearError("email"); }}
                leftIcon="mail"
                keyboardType="email-address"
                error={errors.email}
              />
              <InputField
                label="Password"
                placeholder="At least 6 characters"
                value={password}
                onChangeText={(t) => { setPassword(t); clearError("password"); }}
                leftIcon="lock"
                isPassword
                error={errors.password}
              />
            </View>

            <PrimaryButton label="Create Account" onPress={handleSignup} loading={loading} />
          </View>

          <View style={styles.privacyRow}>
            <Feather name="shield" size={13} color={colors.mutedForeground} />
            <Text style={[styles.privacyText, { color: colors.mutedForeground }]}>
              Your email is private. Others only see your name and bio.
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.link, { color: colors.primary }]}>  Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  heroBg: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 4,
  },
  backBtn: { marginBottom: 12, padding: 4, alignSelf: "flex-start" },
  heroTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
  },
  scroll: { paddingHorizontal: 20, paddingTop: 4, gap: 16 },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  fields: { gap: 14 },
  privacyRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  privacyText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  footerText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  link: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
