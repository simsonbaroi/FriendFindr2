import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile } from "@/services/userService";
import {
  getRequestStatus,
  sendRequest,
  cancelRequest,
  approveRequest,
  rejectRequest,
  RequestStatus,
} from "@/services/requestService";
import { chatIdFor } from "@/services/chatService";
import { UserProfile } from "@/context/AuthContext";
import { Avatar } from "@/components/Avatar";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function UserProfileScreen() {
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [reqStatus, setReqStatus] = useState<RequestStatus | null>(null);
  const [reqDirection, setReqDirection] = useState<"sent" | "received" | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const topPad = insets.top;

  const load = async () => {
    if (!uid || !currentUser) return;
    setLoading(true);
    try {
      const [p, status] = await Promise.all([
        getUserProfile(uid),
        getRequestStatus(currentUser.uid, uid),
      ]);
      setProfile(p);
      setReqStatus(status.status);
      setReqDirection(status.direction);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [uid]);

  const handleSend = async () => {
    if (!currentUser || !uid) return;
    setActionLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await sendRequest(currentUser.uid, uid);
      await load();
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!currentUser || !uid) return;
    setActionLoading(true);
    try {
      await cancelRequest(currentUser.uid, uid);
      await load();
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!currentUser || !uid) return;
    setActionLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await approveRequest(uid, currentUser.uid);
      await load();
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenChat = () => {
    if (!currentUser || !uid) return;
    router.push({ pathname: "/chat/[chatId]", params: { chatId: chatIdFor(currentUser.uid, uid) } });
  };

  const renderAction = () => {
    if (!currentUser || uid === currentUser.uid) return null;

    if (reqStatus === "approved") {
      return (
        <View style={styles.actionArea}>
          <PrimaryButton label="Open Chat" onPress={handleOpenChat} />
          <View style={[styles.statusBadge, { backgroundColor: colors.success + "14", borderColor: colors.success + "28" }]}>
            <Feather name="check-circle" size={14} color={colors.success} />
            <Text style={[styles.statusText, { color: colors.success }]}>You're connected</Text>
          </View>
        </View>
      );
    }

    if (reqStatus === "pending" && reqDirection === "sent") {
      return (
        <View style={styles.actionArea}>
          <View style={[styles.statusBadge, { backgroundColor: colors.warning + "14", borderColor: colors.warning + "28" }]}>
            <Feather name="clock" size={14} color={colors.warning} />
            <Text style={[styles.statusText, { color: colors.warning }]}>Request sent — awaiting response</Text>
          </View>
          <PrimaryButton label="Cancel Request" onPress={handleCancel} loading={actionLoading} variant="ghost" />
        </View>
      );
    }

    if (reqStatus === "pending" && reqDirection === "received") {
      return (
        <View style={styles.actionArea}>
          <View style={[styles.statusBadge, { backgroundColor: colors.primary + "14", borderColor: colors.primary + "28" }]}>
            <Feather name="user-plus" size={14} color={colors.primary} />
            <Text style={[styles.statusText, { color: colors.primary }]}>
              This person wants to connect with you
            </Text>
          </View>
          <PrimaryButton label="Accept Request" onPress={handleApprove} loading={actionLoading} />
          <PrimaryButton
            label="Decline"
            onPress={async () => {
              if (!currentUser || !uid) return;
              await rejectRequest(uid, currentUser.uid);
              load();
            }}
            variant="ghost"
          />
        </View>
      );
    }

    return (
      <View style={styles.actionArea}>
        <PrimaryButton
          label="Send Connection Request"
          onPress={handleSend}
          loading={actionLoading}
        />
        <Text style={[styles.actionNote, { color: colors.mutedForeground }]}>
          A request is sent privately — they won't see your contact info
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <View style={[styles.notFoundIcon, { backgroundColor: colors.muted }]}>
          <Feather name="user-x" size={32} color={colors.mutedForeground} />
        </View>
        <Text style={[styles.notFound, { color: colors.foreground }]}>User not found</Text>
        <TouchableOpacity
          style={[styles.backPill, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backPillText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        <LinearGradient
          colors={["#071020", "#0D1C38"]}
          style={[styles.hero, { paddingTop: topPad + 12 }]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>

          <View style={styles.heroContent}>
            <View style={styles.avatarWrap}>
              <Avatar uri={profile.photoURL} name={profile.displayName} size={92} />
            </View>
            <Text style={styles.heroName}>{profile.displayName}</Text>
            <Text style={styles.heroUsername}>@{profile.username}</Text>
            {!!profile.profession && (
              <View style={styles.profPill}>
                <Feather name="briefcase" size={11} color="rgba(255,255,255,0.7)" />
                <Text style={styles.profPillText}>{profile.profession}</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <View
            style={[
              styles.privacyBadge,
              { backgroundColor: colors.success + "12", borderColor: colors.success + "25" },
            ]}
          >
            <View style={[styles.privacyIconBox, { backgroundColor: colors.success + "20" }]}>
              <Feather name="shield" size={13} color={colors.success} />
            </View>
            <Text style={[styles.privacyText, { color: colors.success }]}>
              Contact info stays private until you both connect
            </Text>
          </View>

          {!!profile.bio && (
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>About</Text>
              <Text style={[styles.infoText, { color: colors.foreground }]}>{profile.bio}</Text>
            </View>
          )}

          {profile.tags?.length > 0 && (
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Interests</Text>
              <View style={styles.tagsRow}>
                {profile.tags.map((t) => (
                  <View key={t} style={[styles.tag, { backgroundColor: colors.primary + "14" }]}>
                    <Text style={[styles.tagText, { color: colors.primary }]}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {!!profile.country && (
            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                },
              ]}
            >
              <Feather name="map-pin" size={15} color={colors.mutedForeground} />
              <Text style={[styles.infoText, { color: colors.foreground }]}>{profile.country}</Text>
            </View>
          )}

          {renderAction()}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  notFoundIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  notFound: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  backPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backPillText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  backBtn: {
    padding: 8,
    marginBottom: 16,
    alignSelf: "flex-start",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  heroContent: { alignItems: "center", gap: 8 },
  avatarWrap: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    marginBottom: 4,
  },
  heroName: {
    fontSize: 24,
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
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  profPillText: { fontSize: 13, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.8)" },
  body: { padding: 20, gap: 12 },
  privacyBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
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
  infoCard: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 10 },
  infoLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  infoText: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  tagText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  actionArea: { gap: 10, marginTop: 4 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  statusText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  actionNote: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
});
