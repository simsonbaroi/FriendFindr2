import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
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
}

function SettingRow({ icon, label, onPress, value, danger, colors }: RowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: danger ? colors.destructive + "15" : colors.secondary },
        ]}
      >
        <Feather name={icon} size={17} color={danger ? colors.destructive : colors.primary} />
      </View>
      <Text
        style={[styles.rowLabel, { color: danger ? colors.destructive : colors.foreground }]}
      >
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

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

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
      <StatusBar barStyle="light-content" />

      {/* Hero gradient */}
      <LinearGradient
        colors={["#0A1628", "#0F2040"]}
        style={[styles.heroBg, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.heroInner}>
          <Avatar uri={profile.photoURL} name={profile.displayName} size={80} />
          <View style={styles.heroText}>
            <Text style={styles.heroName}>{profile.displayName}</Text>
            <Text style={styles.heroUsername}>@{profile.username}</Text>
            {!!profile.profession && (
              <View style={styles.profPill}>
                <Feather name="briefcase" size={11} color="rgba(255,255,255,0.7)" />
                <Text style={styles.profPillText}>{profile.profession}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push("/edit-profile")}
          >
            <Feather name="edit-2" size={16} color="rgba(255,255,255,0.8)" />
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
            <Feather name="map-pin" size={13} color="rgba(255,255,255,0.5)" />
            <Text style={styles.locationText}>{profile.country}</Text>
          </View>
        )}
      </LinearGradient>

      {/* Privacy badge */}
      <View style={[styles.badge, { backgroundColor: colors.success + "12", borderColor: colors.success + "28" }]}>
        <Feather name="shield" size={15} color={colors.success} />
        <Text style={[styles.badgeText, { color: colors.success }]}>
          Your email and phone are always private
        </Text>
      </View>

      {/* Settings */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Account</Text>
        <SettingRow icon="edit-2" label="Edit Profile" onPress={() => router.push("/edit-profile")} colors={colors} />
        <SettingRow icon="shield" label="Privacy Settings" onPress={() => router.push("/privacy-settings")} colors={colors} />
        <SettingRow icon="settings" label="Settings" onPress={() => router.push("/settings")} colors={colors} />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Danger zone</Text>
        <SettingRow icon="log-out" label="Sign Out" onPress={handleLogout} danger colors={colors} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroBg: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  heroInner: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  heroText: { flex: 1, gap: 3 },
  heroName: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  heroUsername: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
  },
  profPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  profPillText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.7)",
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroBio: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
    lineHeight: 20,
  },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
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
    color: "rgba(255,255,255,0.5)",
  },
  badge: {
    margin: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badgeText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  section: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
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
