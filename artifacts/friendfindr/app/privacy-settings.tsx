import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { updateUserProfile } from "@/services/userService";

function ToggleRow({
  icon,
  label,
  description,
  value,
  onChange,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const colors = useColors();
  return (
    <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.toggleIcon, { backgroundColor: colors.secondary }]}>
        <Feather name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.toggleInfo}>
        <Text style={[styles.toggleLabel, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.toggleDesc, { color: colors.mutedForeground }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={(v) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onChange(v);
        }}
        trackColor={{ false: colors.border, true: colors.primary + "88" }}
        thumbColor={value ? colors.primary : colors.mutedForeground}
      />
    </View>
  );
}

export default function PrivacySettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, refreshProfile } = useAuth();

  const [searchVisible, setSearchVisible] = useState(profile?.searchVisible ?? true);
  const [allowRequests, setAllowRequests] = useState(profile?.allowRequests ?? true);

  const topPad = insets.top;
  const botPad = insets.bottom;

  const save = async (field: string, value: boolean) => {
    if (!profile) return;
    await updateUserProfile(profile.uid, { [field]: value });
    await refreshProfile();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: botPad + 40 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle={colors.statusBar} translucent backgroundColor="transparent" />

      <View style={[styles.header, { paddingTop: topPad + 14, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Privacy Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.shield, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "20" }]}>
        <View style={[styles.shieldIconBox, { backgroundColor: colors.primary + "18" }]}>
          <Feather name="shield" size={20} color={colors.primary} />
        </View>
        <View style={styles.shieldText}>
          <Text style={[styles.shieldTitle, { color: colors.foreground }]}>Always protected</Text>
          <Text style={[styles.shieldSub, { color: colors.mutedForeground }]}>
            Your email and phone number are NEVER shared with other users.
          </Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Discovery</Text>
        <ToggleRow
          icon="eye"
          label="Appear in Search"
          description="Let others find you by name, username, or profession"
          value={searchVisible}
          onChange={(v) => {
            setSearchVisible(v);
            save("searchVisible", v);
          }}
        />
        <ToggleRow
          icon="user-plus"
          label="Allow Connection Requests"
          description="Others can send you a request to connect"
          value={allowRequests}
          onChange={(v) => {
            setAllowRequests(v);
            save("allowRequests", v);
          }}
        />
      </View>

      <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="info" size={16} color={colors.mutedForeground} />
        <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
          Even when visible, only your name, username, bio, and profession are shown. Private
          contact details are always hidden.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 6, borderRadius: 10 },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  shield: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  shieldIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  shieldText: { flex: 1, gap: 4 },
  shieldTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  shieldSub: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  section: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    paddingTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  toggleIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  toggleInfo: { flex: 1, gap: 2 },
  toggleLabel: { fontSize: 15, fontFamily: "Inter_500Medium" },
  toggleDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 16 },
  infoBox: {
    margin: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
