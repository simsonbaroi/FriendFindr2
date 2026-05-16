import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
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

  const topPad = Platform.OS === "web" ? 67 : insets.top;

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
          <View style={[styles.connectedBadge, { backgroundColor: colors.success + "15", borderColor: colors.success + "30" }]}>
            <Feather name="check-circle" size={15} color={colors.success} />
            <Text style={[styles.connectedText, { color: colors.success }]}>You're connected</Text>
          </View>
        </View>
      );
    }

    if (reqStatus === "pending" && reqDirection === "sent") {
      return (
        <View style={styles.actionArea}>
          <View style={[styles.pendingBadge, { backgroundColor: colors.warning + "15", borderColor: colors.warning + "30" }]}>
            <Feather name="clock" size={15} color={colors.warning} />
            <Text style={[styles.pendingText, { color: colors.warning }]}>Request sent — awaiting response</Text>
          </View>
          <PrimaryButton label="Cancel Request" onPress={handleCancel} loading={actionLoading} variant="ghost" />
        </View>
      );
    }

    if (reqStatus === "pending" && reqDirection === "received") {
      return (
        <View style={styles.actionArea}>
          <View style={[styles.pendingBadge, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
            <Feather name="user-plus" size={15} color={colors.primary} />
            <Text style={[styles.pendingText, { color: colors.primary }]}>This person wants to connect with you</Text>
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
          A request will be sent privately — they won't see your contact info
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
        <Feather name="user-x" size={40} color={colors.mutedForeground} />
        <Text style={[styles.notFound, { color: colors.mutedForeground }]}>User not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.primary }]}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Hero */}
        <LinearGradient
          colors={["#0A1628", "#0F2040"]}
          style={[styles.hero, { paddingTop: topPad + 8 }]}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>

          <View style={styles.heroContent}>
            <Avatar uri={profile.photoURL} name={profile.displayName} size={88} />
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
          {/* Privacy badge */}
          <View style={[styles.privacyBadge, { backgroundColor: colors.success + "12", borderColor: colors.success + "25" }]}>
            <Feather name="shield" size={14} color={colors.success} />
            <Text style={[styles.privacyText, { color: colors.success }]}>
              Contact info stays private until you both connect
            </Text>
          </View>

          {/* Bio */}
          {!!profile.bio && (
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>About</Text>
              <Text style={[styles.infoText, { color: colors.foreground }]}>{profile.bio}</Text>
            </View>
          )}

          {/* Tags */}
          {profile.tags?.length > 0 && (
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Interests</Text>
              <View style={styles.tagsRow}>
                {profile.tags.map((t) => (
                  <View key={t} style={[styles.tag, { backgroundColor: colors.primary + "12" }]}>
                    <Text style={[styles.tagText, { color: colors.primary }]}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Country */}
          {!!profile.country && (
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: 10 }]}>
              <Feather name="map-pin" size={16} color={colors.mutedForeground} />
              <Text style={[styles.infoText, { color: colors.foreground }]}>{profile.country}</Text>
            </View>
          )}

          {/* Action */}
          {renderAction()}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFound: { fontSize: 16, fontFamily: "Inter_400Regular" },
  backLink: { fontSize: 14, fontFamily: "Inter_500Medium" },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  backBtn: { padding: 4, marginBottom: 16, alignSelf: "flex-start" },
  heroContent: { alignItems: "center", gap: 8 },
  heroName: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  heroUsername: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)" },
  profPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  profPillText: { fontSize: 13, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.8)" },
  body: { padding: 20, gap: 12 },
  privacyBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  privacyText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  infoCard: { padding: 16, borderRadius: 14, borderWidth: 1, gap: 8 },
  infoLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoText: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  tagText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  actionArea: { gap: 10, marginTop: 4 },
  connectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  connectedText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  pendingText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  actionNote: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
});
