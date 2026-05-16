import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { searchUsers } from "@/services/userService";
import { UserProfile } from "@/context/AuthContext";
import { UserCard } from "@/components/UserCard";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleSearch = useCallback(async () => {
    if (!query.trim() || !user) return;
    setLoading(true);
    setSearched(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const found = await searchUsers(query, user.uid);
      setResults(found);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [query, user]);

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} />

      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.brand, { color: colors.primary }]}>FriendFindr</Text>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
              {profile?.displayName ? `Hello, ${profile.displayName.split(" ")[0]}` : "Find people"}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.settingsBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/settings")}
          >
            <Feather name="settings" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.card,
              borderColor: query ? colors.primary : colors.border,
            },
          ]}
        >
          <Feather name="search" size={18} color={query ? colors.primary : colors.mutedForeground} />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Name, username, profession, tags…"
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {!!query && (
            <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x-circle" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {!!query.trim() && (
          <TouchableOpacity
            style={[styles.searchBtn, { backgroundColor: colors.primary }]}
            onPress={handleSearch}
            activeOpacity={0.8}
          >
            <Feather name="search" size={16} color="#fff" />
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Searching…</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.uid}
          contentContainerStyle={[styles.list, { paddingBottom: 120 }]}
          scrollEnabled={results.length > 0}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            searched && results.length > 0 ? (
              <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
                {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              {searched ? (
                <>
                  <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
                    <Feather name="user-x" size={28} color={colors.mutedForeground} />
                  </View>
                  <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No results found</Text>
                  <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                    Try searching by a different name, username, or profession
                  </Text>
                </>
              ) : (
                <>
                  <View style={[styles.emptyIcon, { backgroundColor: colors.primary + "15" }]}>
                    <Feather name="users" size={28} color={colors.primary} />
                  </View>
                  <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                    Search for people
                  </Text>
                  <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                    Find and reconnect with people by name, username, profession, or shared interests.
                    Your contact info stays private.
                  </Text>

                  {/* Tips */}
                  <View style={[styles.tipsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.tipsTitle, { color: colors.foreground }]}>Search tips</Text>
                    {[
                      ["at-sign", "Try their @username"],
                      ["briefcase", "Search by profession"],
                      ["tag", "Use a shared interest or tag"],
                    ].map(([icon, tip]) => (
                      <View key={tip} style={styles.tipRow}>
                        <Feather name={icon as any} size={14} color={colors.primary} />
                        <Text style={[styles.tipText, { color: colors.mutedForeground }]}>{tip}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <UserCard
              user={item}
              onPress={() =>
                router.push({ pathname: "/profile/[uid]", params: { uid: item.uid } })
              }
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { fontSize: 20, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 1 },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  searchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: 12,
    gap: 6,
  },
  searchBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  list: { padding: 16 },
  resultCount: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  emptyBox: { alignItems: "center", paddingTop: 48, gap: 12, paddingHorizontal: 16 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  tipsCard: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    marginTop: 8,
  },
  tipsTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  tipText: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
