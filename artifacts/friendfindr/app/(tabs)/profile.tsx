import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/Avatar";

interface RowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  value?: string;
  danger?: boolean;
  colors: any;
  last?: boolean;
}

function SettingRow({ icon, label, onPress, value, danger, colors, last }: RowProps) {
  return (
    <TouchableOpacity
      style={[
        styles.row,
        { borderBottomColor: colors.border },
        last && { borderBottomWidth: 0 },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: danger ? colors.destructive + "18" : colors.secondary },
        ]}
      >
        <Feather name={icon} size={17} color={danger ? colors.destructive : colors.primary} />
      </View>
      <Text style={[styles.rowLabel, { color: danger ? colors.destructive : colors.foreground }]}>
        {label}
      </Text>
      {value ? (
        <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text>
      ) : (
        <Feather name="chevron-right" size={16} color={colors.border} />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, logout } = useAuth();

  const topPad = insets.top;
  const botPad = insets.bottom;

  const handleLogout = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  };

  if (!profile) return null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: botPad + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={["#071020", "#0D1C38"]}
        style={[styles.heroBg, { paddingTop: topPad + 20 }]}
      >
        <View style={styles.heroInner}>
          <View style={styles.avatarWrap}>
            <Avatar uri={profile.photoURL} name={profile.displayName} size={84} />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroName}>{profile.displayName}</Text>
            <Text style={styles.heroUsername}>@{profile.username}</Text>
            {!!profile.profession && (
              <View style={styles.profPill}>
                <Feather name="briefcase" size={11} color="rgba(255,255,255,0.65)" />
                <Text style={styles.profPillText}>{profile.profession}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={[styles.editBtn, { borderColor: "rgba(255,255,255,0.2)" }]}
            onPress={() => router.push("/edit-profile")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="edit-2" size={15} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>
        </View>

        {!!profile.bio && (
          <Text style={styles.heroBio}>{profile.bio}</Text>
        )}

        {profile.tags?.length > 0 && (
          <View style={styles.tagsRow}>
            {profile.tags.map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        )}

        {!!profile.country && (
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={12} color="rgba(255,255,255,0.45)" />
            <Text style={styles.locationText}>{profile.country}</Text>
          </View>
        )}
      </LinearGradient>

      <View style={[styles.privacyBanner, { backgroundColor: colors.success + "14", borderColor: colors.success + "30" }]}>
        <View style={[styles.privacyIconBox, { backgroundColor: colors.success + "20" }]}>
          <Feather name="shield" size={14} color={colors.success} />
        </View>
        <Text style={[styles.privacyText, { color: colors.success }]}>
          Your email and phone are always private
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Account</Text>
        <SettingRow icon="edit-2" label="Edit Profile" onPress={() => router.push("/edit-profile")} colors={colors} />
        <SettingRow icon="shield" label="Privacy Settings" onPress={() => router.push("/privacy-settings")} colors={colors} />
        <SettingRow icon="settings" label="Settings" onPress={() => router.push("/settings")} colors={colors} last />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Danger zone</Text>
        <SettingRow icon="log-out" label="Sign Out" onPress={handleLogout} danger colors={colors} last />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroBg: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 14,
  },
  heroInner: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  avatarWrap: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  heroText: { flex: 1, gap: 4, paddingTop: 2 },
  heroName: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  heroUsername: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)",
  },
  profPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  profPillText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.65)",
  },
  editBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  heroBio: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.65)",
    lineHeight: 21,
  },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  tagText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.8)",
  },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  locationText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.45)",
  },
  privacyBanner: {
    margin: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  privacyIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  privacyText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  section: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  rowValue: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
