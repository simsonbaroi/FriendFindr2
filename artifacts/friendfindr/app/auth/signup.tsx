import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
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
  const [authError, setAuthError] = useState("");

  const topPad = insets.top;
  const botPad = insets.bottom;

  const clearError = (field: string) =>
    setErrors((e) => { const n = { ...e }; delete n[field]; return n; });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!displayName.trim()) e.displayName = "Name is required";
    if (!username.trim()) e.username = "Username is required";
    else if (!/^[a-zA-Z0-9_]{3,20}$/.test(username))
      e.username = "3–20 chars: letters, numbers, underscores";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "At least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    setAuthError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await signup(email.trim(), password, displayName.trim(), username.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setAuthError(
        err.code === "auth/email-already-in-use"
          ? "An account with this email already exists."
          : err.code === "auth/weak-password"
          ? "Password is too weak. Use at least 6 characters."
          : err.code === "auth/network-request-failed"
          ? "Network error. Check your connection."
          : err.message ?? "Account creation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={["#071020", "#0D1C38", colors.background]}
        style={[styles.heroBg, { paddingTop: topPad + 16 }]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <Text style={styles.heroTitle}>Create account</Text>
        <Text style={styles.heroSub}>Join FriendFindr today</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "android" ? 24 : 0}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(botPad, 24) + 24 }]}
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
                autoCapitalize="none"
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

            {!!authError && (
              <View style={[styles.errorBanner, { backgroundColor: "#E53E3E18", borderColor: "#E53E3E30" }]}>
                <Feather name="alert-circle" size={15} color="#E53E3E" />
                <Text style={styles.errorText}>{authError}</Text>
              </View>
            )}

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
            <TouchableOpacity onPress={() => router.back()} style={styles.footerLink}>
              <Text style={[styles.link, { color: colors.primary }]}>Sign in</Text>
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
    gap: 6,
  },
  backBtn: {
    marginBottom: 16,
    padding: 8,
    alignSelf: "flex-start",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.5)",
  },
  scroll: { paddingHorizontal: 20, paddingTop: 4, gap: 18 },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 24,
    gap: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  fields: { gap: 14 },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#E53E3E",
    lineHeight: 18,
  },
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
    gap: 6,
  },
  footerText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  footerLink: { paddingVertical: 2, paddingHorizontal: 2 },
  link: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
