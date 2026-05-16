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
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/Avatar";

const SUPPORT_EMAIL = "friendfindr.support@gmail.com";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, logout } = useAuth();

  const topPad = insets.top;
  const botPad = insets.bottom;

  const openSupport = () => router.push("/contact-support");
  const showPrivacyPolicy = () => router.push("/privacy-policy");

  const Row = ({
    icon,
    label,
    onPress,
    value,
    danger,
    last,
  }: {
    icon: keyof typeof Feather.glyphMap;
    label: string;
    onPress: () => void;
    value?: string;
    danger?: boolean;
    last?: boolean;
  }) => (
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
          { backgroundColor: danger ? colors.destructive + "15" : colors.secondary },
        ]}
      >
        <Feather
          name={icon}
          size={17}
          color={danger ? colors.destructive : colors.primary}
        />
      </View>
      <Text style={[styles.rowLabel, { color: danger ? colors.destructive : colors.foreground }]}>
        {label}
      </Text>
      {value ? (
        <Text style={[styles.rowValue, { color: colors.mutedForeground }]} numberOfLines={1}>
          {value}
        </Text>
      ) : (
        <Feather name="chevron-right" size={16} color={colors.border} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: botPad + 40 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle={colors.statusBar} translucent backgroundColor="transparent" />

      <View
        style={[
          styles.header,
          { paddingTop: topPad + 14, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <TouchableOpacity
        style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => router.push("/(tabs)/profile")}
        activeOpacity={0.75}
      >
        <Avatar uri={profile?.photoURL} name={profile?.displayName ?? "?"} size={52} />
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.foreground }]}>
            {profile?.displayName}
          </Text>
          <Text style={[styles.profileUsername, { color: colors.mutedForeground }]}>
            @{profile?.username}
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.border} />
      </TouchableOpacity>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Account</Text>
        <Row icon="edit-2" label="Edit Profile" onPress={() => router.push("/edit-profile")} />
        <Row icon="shield" label="Privacy Settings" onPress={() => router.push("/privacy-settings")} />
        <Row icon="mail" label="Email" value={profile?.email ?? ""} onPress={() => {}} last />
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Support & Legal</Text>
        <Row icon="help-circle" label="Contact Support" onPress={openSupport} />
        <Row icon="lock" label="Privacy Policy" onPress={showPrivacyPolicy} />
        <Row icon="info" label="Version" value="v1.0.0" onPress={() => {}} last />
      </View>

      <View
        style={[
          styles.supportCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={[styles.supportIconBox, { backgroundColor: colors.primary + "14" }]}>
          <Feather name="mail" size={15} color={colors.primary} />
        </View>
        <View style={styles.supportText}>
          <Text style={[styles.supportLabel, { color: colors.foreground }]}>Support Email</Text>
          <Text style={[styles.supportEmail, { color: colors.primary }]}>{SUPPORT_EMAIL}</Text>
        </View>
        <TouchableOpacity
          onPress={openSupport}
          style={[styles.supportBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.supportBtnText}>Email</Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border, marginTop: 4 },
        ]}
      >
        <Row
          icon="log-out"
          label="Sign Out"
          onPress={() =>
            Alert.alert("Sign out?", "You will be returned to the login screen.", [
              { text: "Cancel", style: "cancel" },
              { text: "Sign Out", style: "destructive", onPress: logout },
            ])
          }
          danger
          last
        />
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
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 6, borderRadius: 10 },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  profileInfo: { flex: 1, gap: 2 },
  profileName: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  profileUsername: { fontSize: 13, fontFamily: "Inter_400Regular" },
  section: {
    marginHorizontal: 16,
    marginBottom: 0,
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
    paddingTop: 12,
    paddingBottom: 4,
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
  rowValue: { fontSize: 13, fontFamily: "Inter_400Regular", maxWidth: 160 },
  supportCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  supportIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  supportText: { flex: 1, gap: 2 },
  supportLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  supportEmail: { fontSize: 12, fontFamily: "Inter_400Regular" },
  supportBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  supportBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
