import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { InputField } from "@/components/InputField";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleReset = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Could not send reset email.");
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
        <Text style={styles.heroTitle}>Reset password</Text>
        <Text style={styles.heroSub}>We'll send a link to your email</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.body, { paddingBottom: botPad + 24 }]}>
          {sent ? (
            <View style={[styles.sentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.checkCircle, { backgroundColor: colors.success + "20" }]}>
                <Feather name="check" size={28} color={colors.success} />
              </View>
              <Text style={[styles.sentTitle, { color: colors.foreground }]}>Email sent!</Text>
              <Text style={[styles.sentBody, { color: colors.mutedForeground }]}>
                Check your inbox for a password reset link. It may take a minute to arrive.
              </Text>
              <PrimaryButton label="Back to Sign In" onPress={() => router.back()} />
            </View>
          ) : (
            <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <InputField
                label="Email address"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                leftIcon="mail"
                keyboardType="email-address"
              />
              <PrimaryButton
                label="Send Reset Link"
                onPress={handleReset}
                loading={loading}
                disabled={!email.trim()}
              />
              <PrimaryButton label="Back to Sign In" onPress={() => router.back()} variant="ghost" />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  body: { flex: 1, padding: 20 },
  sentCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
    gap: 16,
  },
  checkCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  sentTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  sentBody: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  formCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 16,
  },
});
