import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "./Avatar";
import { UserProfile } from "@/context/AuthContext";

interface UserCardProps {
  user: UserProfile;
  onPress: () => void;
  rightElement?: React.ReactNode;
}

export const UserCard = React.memo(function UserCard({ user, onPress, rightElement }: UserCardProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Avatar uri={user.photoURL} name={user.displayName} size={52} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
          {user.displayName}
        </Text>
        <Text style={[styles.username, { color: colors.mutedForeground }]} numberOfLines={1}>
          @{user.username}
        </Text>
        {!!user.bio && (
          <Text style={[styles.bio, { color: colors.mutedForeground }]} numberOfLines={1}>
            {user.bio}
          </Text>
        )}
        {!!user.profession && (
          <View style={[styles.profPill, { backgroundColor: colors.primary + "12" }]}>
            <Feather name="briefcase" size={10} color={colors.primary} />
            <Text style={[styles.profText, { color: colors.primary }]} numberOfLines={1}>
              {user.profession}
            </Text>
          </View>
        )}
        {user.tags?.length > 0 && (
          <View style={styles.tagsRow}>
            {user.tags.slice(0, 3).map((t) => (
              <View key={t} style={[styles.tag, { backgroundColor: colors.muted }]}>
                <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{t}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      {rightElement ?? <Feather name="chevron-right" size={17} color={colors.border} />}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 16, borderWidth: 1, gap: 12 },
  info: { flex: 1, gap: 3 },
  name: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  username: { fontSize: 13, fontFamily: "Inter_400Regular" },
  bio: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 1 },
  profPill: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, gap: 4, marginTop: 2 },
  profText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  tagsRow: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginTop: 4 },
  tag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  tagText: { fontSize: 10, fontFamily: "Inter_400Regular" },
});
