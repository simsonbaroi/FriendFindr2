import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { updateUserProfile } from "@/services/userService";
import { InputField } from "@/components/InputField";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function EditProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, refreshProfile } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [country, setCountry] = useState(profile?.country ?? "");
  const [profession, setProfession] = useState(profile?.profession ?? "");
  const [tagsText, setTagsText] = useState((profile?.tags ?? []).join(", "));
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSave = async () => {
    if (!profile) return;
    if (!displayName.trim()) {
      Alert.alert("Name required", "Please enter your display name.");
      return;
    }
    setLoading(true);
    try {
      const tags = tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await updateUserProfile(profile.uid, {
        displayName: displayName.trim(),
        bio: bio.trim(),
        country: country.trim(),
        profession: profession.trim(),
        tags,
      });
      await refreshProfile();
      Alert.alert("Saved", "Your profile has been updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Could not save profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: botPad + 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Edit Profile</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.form}>
        <InputField
          label="Display Name"
          value={displayName}
          onChangeText={setDisplayName}
          leftIcon="user"
          placeholder="Your full name"
        />
        <InputField
          label="Bio"
          value={bio}
          onChangeText={setBio}
          leftIcon="file-text"
          placeholder="Tell people about yourself"
          multiline
          numberOfLines={3}
        />
        <InputField
          label="Country"
          value={country}
          onChangeText={setCountry}
          leftIcon="map-pin"
          placeholder="e.g. United States"
        />
        <InputField
          label="Profession"
          value={profession}
          onChangeText={setProfession}
          leftIcon="briefcase"
          placeholder="e.g. Software Engineer"
        />
        <InputField
          label="Interests / Tags (comma-separated)"
          value={tagsText}
          onChangeText={setTagsText}
          leftIcon="tag"
          placeholder="e.g. design, travel, music"
        />
        <PrimaryButton label="Save Changes" onPress={handleSave} loading={loading} />
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
  form: { padding: 20, gap: 16 },
});
