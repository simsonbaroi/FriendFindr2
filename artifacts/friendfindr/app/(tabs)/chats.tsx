import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  RefreshControl,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { subscribeToChats, Chat } from "@/services/chatService";
import { getUserProfiles } from "@/services/userService";
import { UserProfile } from "@/context/AuthContext";
import { Avatar } from "@/components/Avatar";

interface ChatItem {
  chat: Chat;
  otherUser: UserProfile | null;
}

function formatTime(ts: any): string {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ChatsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [chatItems, setChatItems] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Track which profiles we've already fetched to avoid redundant work
  const fetchedUids = useRef(new Set<string>());

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToChats(user.uid, async (chats) => {
      // Only fetch profiles for users we haven't loaded yet
      const neededUids = chats
        .map((chat) => chat.participants.find((p) => p !== user.uid) ?? "")
        .filter((uid) => uid && !fetchedUids.current.has(uid));

      if (neededUids.length > 0) {
        neededUids.forEach((uid) => fetchedUids.current.add(uid));
        await getUserProfiles(neededUids); // warms the cache
      }

      // Now build items from cache (synchronous after warm)
      const items: ChatItem[] = await Promise.all(
        chats.map(async (chat) => {
          const otherUid = chat.participants.find((p) => p !== user.uid) ?? "";
          const profiles = otherUid ? await getUserProfiles([otherUid]) : new Map();
          return { chat, otherUser: profiles.get(otherUid) ?? null };
        })
      );

      setChatItems(items);
      setLoading(false);
      setRefreshing(false);
    });
    return unsub;
  }, [user]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} />

      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, borderBottomColor: colors.border, backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Messages</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={chatItems}
          keyExtractor={(item) => item.chat.id}
          contentContainerStyle={[styles.list, { paddingBottom: 120 }]}
          scrollEnabled={chatItems.length > 0}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => setRefreshing(true)}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.primary + "15" }]}>
                <Feather name="message-circle" size={28} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No messages yet</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                Once you and another user both accept each other's connection requests, you'll be
                able to chat here.
              </Text>
              <TouchableOpacity
                style={[styles.cta, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/(tabs)/home")}
              >
                <Text style={styles.ctaText}>Find people to connect with</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <ChatRow
              item={item}
              colors={colors}
              onPress={() =>
                router.push({ pathname: "/chat/[chatId]", params: { chatId: item.chat.id } })
              }
            />
          )}
        />
      )}
    </View>
  );
}

const ChatRow = React.memo(function ChatRow({
  item,
  colors,
  onPress,
}: {
  item: ChatItem;
  colors: any;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.chatRow, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Avatar uri={item.otherUser?.photoURL} name={item.otherUser?.displayName ?? "?"} size={54} />
      <View style={styles.chatInfo}>
        <View style={styles.chatTopRow}>
          <Text style={[styles.chatName, { color: colors.foreground }]} numberOfLines={1}>
            {item.otherUser?.displayName ?? "Unknown"}
          </Text>
          <Text style={[styles.chatTime, { color: colors.mutedForeground }]}>
            {formatTime(item.chat.lastMessageAt)}
          </Text>
        </View>
        <Text style={[styles.lastMsg, { color: colors.mutedForeground }]} numberOfLines={1}>
          {item.chat.lastMessage || "Say hello 👋"}
        </Text>
      </View>
      <Feather name="chevron-right" size={16} color={colors.border} />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  list: { padding: 16, gap: 10 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyBox: { alignItems: "center", paddingTop: 60, gap: 12, paddingHorizontal: 24 },
  emptyIcon: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  cta: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  ctaText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  chatRow: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 16, borderWidth: 1, gap: 12 },
  chatInfo: { flex: 1, gap: 4 },
  chatTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chatName: { fontSize: 15, fontFamily: "Inter_600SemiBold", flex: 1 },
  chatTime: { fontSize: 12, fontFamily: "Inter_400Regular" },
  lastMsg: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
