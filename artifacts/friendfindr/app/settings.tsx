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

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, logout } = useAuth();

  const topPad = insets.top;
  const botPad = insets.bottom;

  const Row = ({
    icon,
    label,
    onPress,
    value,
    danger,
  }: {
    icon: keyof typeof Feather.glyphMap;
    label: string;
    onPress: () => void;
    value?: string;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
    >
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: danger ? colors.destructive + "15" : colors.secondary },
        ]}
      >
        <Feather
          name={icon}
          size={18}
          color={danger ? colors.destructive : colors.primary}
        />
      </View>
      <Text style={[styles.rowLabel, { color: danger ? colors.destructive : colors.foreground }]}>
        {label}
      </Text>
      {value ? (
        <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text>
      ) : (
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: botPad + 40 }}
    >
      <StatusBar barStyle={colors.statusBar} />
      <View style={[styles.header, { paddingTop: topPad + 14, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Profile summary */}
      <TouchableOpacity
        style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => router.push("/(tabs)/profile")}
      >
        <Avatar uri={profile?.photoURL} name={profile?.displayName ?? "?"} size={52} />
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.foreground }]}>{profile?.displayName}</Text>
          <Text style={[styles.profileUsername, { color: colors.mutedForeground }]}>
            @{profile?.username}
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      </TouchableOpacity>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Account</Text>
        <Row icon="edit-2" label="Edit Profile" onPress={() => router.push("/edit-profile")} />
        <Row icon="shield" label="Privacy Settings" onPress={() => router.push("/privacy-settings")} />
        <Row icon="mail" label="Email" value={profile?.email ?? ""} onPress={() => {}} />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>About</Text>
        <Row icon="info" label="FriendFindr" value="MVP v1.0" onPress={() => {}} />
        <Row
          icon="lock"
          label="Privacy Policy"
          onPress={() => Alert.alert("Privacy", "Your data is protected. Contact info is never shared.")}
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
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
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  profileUsername: { fontSize: 13, fontFamily: "Inter_400Regular" },
  section: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    paddingTop: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  rowIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  rowValue: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
