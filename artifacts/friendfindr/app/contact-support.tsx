import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const SUPPORT_EMAIL = "friendfindr.support@gmail.com";

const CATEGORIES = [
  { id: "bug", label: "Bug Report", icon: "alert-circle" as const },
  { id: "feature", label: "Feature Request", icon: "star" as const },
  { id: "privacy", label: "Privacy Concern", icon: "shield" as const },
  { id: "account", label: "Account Issue", icon: "user" as const },
  { id: "other", label: "Other", icon: "help-circle" as const },
];

export default function ContactSupportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();

  const [category, setCategory] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const topPad = insets.top;
  const botPad = insets.bottom;

  const canSubmit = !!category && subject.trim().length > 0 && message.trim().length > 10;

  const handleSubmit = async () => {
    if (!canSubmit || !user) return;
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await addDoc(collection(db, "support_tickets"), {
        uid: user.uid,
        displayName: profile?.displayName ?? "",
        email: profile?.email ?? user.email ?? "",
        category,
        subject: subject.trim(),
        message: message.trim(),
        status: "open",
        createdAt: serverTimestamp(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSent(true);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Could not send",
        `Please try emailing us directly at ${SUPPORT_EMAIL}`,
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colors.statusBar} />
        <View style={[styles.header, { paddingTop: topPad + 14, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Contact Support</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.successBox}>
          <View style={[styles.successIcon, { backgroundColor: colors.success + "18" }]}>
            <Feather name="check-circle" size={40} color={colors.success} />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Message sent!</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            We've received your message and will get back to you at{"\n"}
            <Text style={{ color: colors.primary, fontFamily: "Inter_500Medium" }}>
              {profile?.email ?? user?.email}
            </Text>
            {"\n\n"}Usually within 1–2 business days.
          </Text>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} />
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 14, borderBottomColor: colors.border, backgroundColor: colors.background },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Contact Support</Text>
        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={topPad + 64}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.fromCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.fromIconBox, { backgroundColor: colors.primary + "14" }]}>
              <Feather name="user" size={15} color={colors.primary} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.fromLabel, { color: colors.mutedForeground }]}>From</Text>
              <Text style={[styles.fromName, { color: colors.foreground }]}>
                {profile?.displayName ?? "You"}
              </Text>
              <Text style={[styles.fromEmail, { color: colors.mutedForeground }]}>
                {profile?.email ?? user?.email ?? ""}
              </Text>
            </View>
          </View>

          <Text style={[styles.label, { color: colors.foreground }]}>Category</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((cat) => {
              const active = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryBtn,
                    {
                      backgroundColor: active ? colors.primary : colors.card,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setCategory(cat.id)}
                  activeOpacity={0.75}
                >
                  <Feather name={cat.icon} size={15} color={active ? "#fff" : colors.mutedForeground} />
                  <Text
                    style={[
                      styles.categoryLabel,
                      { color: active ? "#fff" : colors.foreground },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.foreground }]}>Subject</Text>
          <View
            style={[
              styles.inputBox,
              {
                backgroundColor: colors.card,
                borderColor: subject ? colors.primary : colors.border,
                borderWidth: subject ? 1.5 : 1,
              },
            ]}
          >
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Brief summary of your issue"
              placeholderTextColor={colors.mutedForeground}
              value={subject}
              onChangeText={setSubject}
              returnKeyType="next"
              maxLength={100}
            />
          </View>

          <Text style={[styles.label, { color: colors.foreground }]}>Message</Text>
          <View
            style={[
              styles.messageBox,
              {
                backgroundColor: colors.card,
                borderColor: message ? colors.primary : colors.border,
                borderWidth: message ? 1.5 : 1,
              },
            ]}
          >
            <TextInput
              style={[styles.messageInput, { color: colors.foreground }]}
              placeholder="Describe your issue in detail. The more context you share, the faster we can help."
              placeholderTextColor={colors.mutedForeground}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={2000}
            />
            <Text style={[styles.charCount, { color: colors.mutedForeground }]}>
              {message.length}/2000
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.submitBtn,
              {
                backgroundColor: canSubmit ? colors.primary : colors.muted,
              },
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Feather name="send" size={16} color={canSubmit ? "#fff" : colors.mutedForeground} />
                <Text
                  style={[
                    styles.submitText,
                    { color: canSubmit ? "#fff" : colors.mutedForeground },
                  ]}
                >
                  Send Message
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={[styles.altRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.altText, { color: colors.mutedForeground }]}>
              Or reach us directly at
            </Text>
            <Text style={[styles.altEmail, { color: colors.primary }]}>{SUPPORT_EMAIL}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 6, borderRadius: 10 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  scroll: { padding: 20, gap: 12 },
  fromCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 4,
  },
  fromIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  fromLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.5 },
  fromName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  fromEmail: { fontSize: 13, fontFamily: "Inter_400Regular" },
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginTop: 4 },
  categoriesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
  },
  categoryLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  inputBox: {
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    justifyContent: "center",
  },
  input: { fontSize: 15, fontFamily: "Inter_400Regular" },
  messageBox: {
    borderRadius: 12,
    padding: 14,
    minHeight: 140,
  },
  messageInput: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    flex: 1,
    minHeight: 100,
  },
  charCount: { fontSize: 11, fontFamily: "Inter_400Regular", alignSelf: "flex-end", marginTop: 8 },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 14,
    marginTop: 4,
  },
  submitText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  altRow: {
    alignItems: "center",
    gap: 4,
    paddingTop: 20,
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  altText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  altEmail: { fontSize: 13, fontFamily: "Inter_500Medium" },
  successBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 14,
  },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  successTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  successSub: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 23,
  },
  doneBtn: {
    marginTop: 8,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 14,
  },
  doneBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
