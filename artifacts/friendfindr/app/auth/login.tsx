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
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { InputField } from "@/components/InputField";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const topPad = insets.top;
  const botPad = insets.bottom;

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg =
        err.code === "auth/invalid-credential" || err.code === "auth/wrong-password"
          ? "Incorrect email or password."
          : err.code === "auth/user-not-found"
          ? "No account found with this email."
          : err.code === "auth/too-many-requests"
          ? "Too many attempts. Try again later."
          : err.message ?? "Login failed. Please try again.";
      Alert.alert("Sign in failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={["#071020", "#0D1C38", colors.background]}
        style={[styles.heroBg, { paddingTop: topPad + 28 }]}
      >
        <View style={styles.logoWrap}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>F</Text>
          </View>
        </View>
        <Text style={styles.heroTitle}>FriendFindr</Text>
        <Text style={styles.heroSub}>Find people. Protect your privacy.</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 32 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Welcome back</Text>
              <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
                Sign in to your account
              </Text>
            </View>

            <View style={styles.fields}>
              <InputField
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: undefined })); }}
                leftIcon="mail"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />
              <InputField
                label="Password"
                placeholder="Your password"
                value={password}
                onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined })); }}
                leftIcon="lock"
                isPassword
                error={errors.password}
              />
              <TouchableOpacity
                onPress={() => router.push("/auth/forgot-password")}
                style={styles.forgotRow}
              >
                <Text style={[styles.forgot, { color: colors.primary }]}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            <PrimaryButton label="Sign In" onPress={handleLogin} loading={loading} />
          </View>

          <View style={styles.privacyRow}>
            <Feather name="shield" size={13} color={colors.mutedForeground} />
            <Text style={[styles.privacyText, { color: colors.mutedForeground }]}>
              Your contact info is never shared with others
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push("/auth/signup")} style={styles.footerLink}>
              <Text style={[styles.link, { color: colors.primary }]}>Create one</Text>
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
    paddingHorizontal: 24,
    paddingBottom: 36,
    alignItems: "center",
    gap: 6,
  },
  logoWrap: { marginBottom: 6 },
  logoBox: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: "#00C4D8",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00C4D8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
  },
  logoLetter: {
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  heroTitle: {
    fontSize: 27,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 16,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: { gap: 4 },
  cardTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  cardSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  fields: { gap: 14 },
  forgotRow: { alignSelf: "flex-end", paddingVertical: 2 },
  forgot: { fontSize: 13, fontFamily: "Inter_500Medium" },
  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  privacyText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  footerText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  footerLink: { padding: 2 },
  link: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
