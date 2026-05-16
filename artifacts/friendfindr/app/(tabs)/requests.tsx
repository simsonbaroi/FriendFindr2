import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import {
  getIncomingRequests,
  getSentRequests,
  approveRequest,
  rejectRequest,
  cancelRequest,
  ContactRequest,
} from "@/services/requestService";
import { getUserProfiles } from "@/services/userService";
import { UserProfile } from "@/context/AuthContext";
import { Avatar } from "@/components/Avatar";

interface RequestItem {
  request: ContactRequest;
  user: UserProfile | null;
}

export default function RequestsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [incoming, setIncoming] = useState<RequestItem[]>([]);
  const [sent, setSent] = useState<RequestItem[]>([]);
  const [tab, setTab] = useState<"incoming" | "sent">("incoming");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const topPad = insets.top;

  const loadRequests = useCallback(async (quiet = false) => {
    if (!user) return;
    if (!quiet) setLoading(true);
    try {
      const [inc, snt] = await Promise.all([
        getIncomingRequests(user.uid),
        getSentRequests(user.uid),
      ]);
      const allUids = [
        ...inc.map((r) => r.fromUid),
        ...snt.map((r) => r.toUid),
      ];
      const profiles = await getUserProfiles(allUids);
      setIncoming(inc.map((r) => ({ request: r, user: profiles.get(r.fromUid) ?? null })));
      setSent(snt.map((r) => ({ request: r, user: profiles.get(r.toUid) ?? null })));
    } catch {
      // Firestore permission errors or network issues — show empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const onRefresh = () => { setRefreshing(true); loadRequests(); };

  const removeFromIncoming = (reqId: string) =>
    setIncoming((prev) => prev.filter((i) => i.request.id !== reqId));
  const removeFromSent = (reqId: string) =>
    setSent((prev) => prev.filter((i) => i.request.id !== reqId));

  const handleApprove = async (req: ContactRequest) => {
    removeFromIncoming(req.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await approveRequest(req.fromUid, req.toUid);
  };

  const handleReject = (req: ContactRequest) => {
    Alert.alert("Decline request?", "This will remove the connection request.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Decline",
        style: "destructive",
        onPress: async () => {
          removeFromIncoming(req.id);
          await rejectRequest(req.fromUid, req.toUid);
        },
      },
    ]);
  };

  const handleCancel = (req: ContactRequest) => {
    Alert.alert("Cancel request?", "You can resend it later.", [
      { text: "Keep", style: "cancel" },
      {
        text: "Cancel Request",
        style: "destructive",
        onPress: async () => {
          removeFromSent(req.id);
          await cancelRequest(req.fromUid, req.toUid);
        },
      },
    ]);
  };

  const items = tab === "incoming" ? incoming : sent;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} translucent backgroundColor="transparent" />

      <View
        style={[
          styles.header,
          { paddingTop: topPad + 14, borderBottomColor: colors.border, backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Requests</Text>

        <View style={[styles.tabs, { backgroundColor: colors.muted }]}>
          {(["incoming", "sent"] as const).map((t) => {
            const count = t === "incoming" ? incoming.length : sent.length;
            const active = tab === t;
            return (
              <TouchableOpacity
                key={t}
                style={[
                  styles.tabBtn,
                  active && {
                    backgroundColor: colors.card,
                    shadowColor: "#000",
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 1 },
                    elevation: 2,
                  },
                ]}
                onPress={() => setTab(t)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: active ? colors.primary : colors.mutedForeground,
                      fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium",
                    },
                  ]}
                >
                  {t === "incoming" ? "Incoming" : "Sent"}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: active ? colors.primary : colors.mutedForeground + "90" },
                    ]}
                  >
                    <Text style={styles.badgeText}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.request.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 90 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
                <Feather name={tab === "incoming" ? "inbox" : "send"} size={26} color={colors.mutedForeground} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                No {tab === "incoming" ? "incoming" : "sent"} requests
              </Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                {tab === "incoming"
                  ? "When someone wants to connect with you, it'll appear here."
                  : "Requests you've sent to others will appear here."}
              </Text>
              {tab === "incoming" && (
                <TouchableOpacity
                  style={[styles.searchCta, { backgroundColor: colors.primary }]}
                  onPress={() => router.push("/(tabs)/home")}
                >
                  <Feather name="search" size={14} color="#fff" />
                  <Text style={styles.searchCtaText}>Search for people</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <RequestCard
              item={item}
              tab={tab}
              onApprove={handleApprove}
              onReject={handleReject}
              onCancel={handleCancel}
              colors={colors}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </View>
  );
}

const RequestCard = React.memo(function RequestCard({
  item,
  tab,
  onApprove,
  onReject,
  onCancel,
  colors,
}: {
  item: RequestItem;
  tab: "incoming" | "sent";
  onApprove: (r: ContactRequest) => void;
  onReject: (r: ContactRequest) => void;
  onCancel: (r: ContactRequest) => void;
  colors: any;
}) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity
        style={styles.cardLeft}
        onPress={() =>
          item.user && router.push({ pathname: "/profile/[uid]", params: { uid: item.user.uid } })
        }
        activeOpacity={0.75}
      >
        <Avatar uri={item.user?.photoURL} name={item.user?.displayName ?? "?"} size={50} />
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, { color: colors.foreground }]} numberOfLines={1}>
            {item.user?.displayName ?? "Unknown user"}
          </Text>
          <Text style={[styles.cardUsername, { color: colors.mutedForeground }]} numberOfLines={1}>
            @{item.user?.username ?? "…"}
          </Text>
          {item.user?.profession ? (
            <View style={styles.profRow}>
              <Feather name="briefcase" size={11} color={colors.mutedForeground} />
              <Text style={[styles.cardProf, { color: colors.mutedForeground }]} numberOfLines={1}>
                {item.user.profession}
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>

      {tab === "incoming" ? (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.approveBtn, { backgroundColor: colors.primary }]}
            onPress={() => onApprove(item.request)}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Feather name="check" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.rejectBtn,
              { backgroundColor: colors.destructive + "14", borderColor: colors.destructive + "30", borderWidth: 1 },
            ]}
            onPress={() => onReject(item.request)}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Feather name="x" size={18} color={colors.destructive} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.cancelPill, { borderColor: colors.border, backgroundColor: colors.muted }]}
          onPress={() => onCancel(item.request)}
        >
          <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth, gap: 14 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold" },
  tabs: { flexDirection: "row", borderRadius: 12, padding: 3 },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  tabLabel: { fontSize: 14 },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  badgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#fff" },
  list: { padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyBox: { alignItems: "center", paddingTop: 60, gap: 12, paddingHorizontal: 24 },
  emptyIcon: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 21 },
  searchCta: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchCtaText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 12 },
  cardInfo: { flex: 1, gap: 2 },
  cardName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  cardUsername: { fontSize: 13, fontFamily: "Inter_400Regular" },
  profRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  cardProf: { fontSize: 12, fontFamily: "Inter_400Regular" },
  actions: { flexDirection: "row", gap: 8 },
  approveBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelPill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  cancelText: { fontSize: 13, fontFamily: "Inter_500Medium" },
});
