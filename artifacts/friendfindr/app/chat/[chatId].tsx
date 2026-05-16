import React, { useEffect, useState, useRef } from "react";
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
import { useLocalSearchParams, router } from "expo-router";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { subscribeToMessages, sendMessage, Message } from "@/services/chatService";
import { getUserProfile } from "@/services/userService";
import { UserProfile } from "@/context/AuthContext";
import { Avatar } from "@/components/Avatar";

const HEADER_HEIGHT = 64;

function formatMsgTime(ts: any): string {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const inputRef = useRef<TextInput>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const topPad = insets.top;
  const botPad = insets.bottom;
  const keyboardOffset = topPad + HEADER_HEIGHT;

  useEffect(() => {
    if (!chatId || !user) return;
    const parts = chatId.split("_");
    const otherUid = parts.find((p) => p !== user.uid) ?? "";
    if (otherUid) {
      getUserProfile(otherUid).then(setOtherUser);
    }
    const unsub = subscribeToMessages(chatId, (msgs) => {
      setMessages(msgs);
      setLoading(false);
    });
    return unsub;
  }, [chatId, user]);

  const handleSend = async () => {
    const msgText = text.trim();
    if (!msgText || !chatId || !user) return;
    setText("");
    setSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await sendMessage(chatId, user.uid, msgText);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMine = item.senderId === user?.uid;
    const nextItem = messages[index - 1];
    const isGrouped = nextItem?.senderId === item.senderId;

    return (
      <View style={[styles.msgRow, isMine && styles.msgRowMine]}>
        {!isMine && (
          <View style={styles.avatarSlot}>
            {!isGrouped ? (
              <Avatar uri={otherUser?.photoURL} name={otherUser?.displayName ?? "?"} size={26} />
            ) : (
              <View style={{ width: 26 }} />
            )}
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isMine
              ? { backgroundColor: colors.primary }
              : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
            !isGrouped && isMine && styles.bubbleTailRight,
            !isGrouped && !isMine && styles.bubbleTailLeft,
          ]}
        >
          <Text style={[styles.bubbleText, { color: isMine ? "#FFFFFF" : colors.foreground }]}>
            {item.text}
          </Text>
          <Text
            style={[
              styles.bubbleTime,
              { color: isMine ? "rgba(255,255,255,0.55)" : colors.mutedForeground },
            ]}
          >
            {formatMsgTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} />

      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 10,
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerUser}
          onPress={() =>
            otherUser &&
            router.push({ pathname: "/profile/[uid]", params: { uid: otherUser.uid } })
          }
          activeOpacity={0.75}
        >
          <Avatar uri={otherUser?.photoURL} name={otherUser?.displayName ?? "?"} size={36} />
          <View style={styles.headerUserText}>
            <Text style={[styles.headerName, { color: colors.foreground }]} numberOfLines={1}>
              {otherUser?.displayName ?? "…"}
            </Text>
            <Text style={[styles.headerUsername, { color: colors.mutedForeground }]}>
              @{otherUser?.username ?? "…"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={keyboardOffset}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            inverted
            contentContainerStyle={styles.msgList}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyMsg}>
                <View style={[styles.emptyMsgIcon, { backgroundColor: colors.primary + "18" }]}>
                  <Feather name="message-circle" size={26} color={colors.primary} />
                </View>
                <Text style={[styles.emptyMsgText, { color: colors.foreground }]}>
                  Start the conversation
                </Text>
                <Text style={[styles.emptyMsgSub, { color: colors.mutedForeground }]}>
                  Say hello to {otherUser?.displayName?.split(" ")[0] ?? "them"}!
                </Text>
              </View>
            }
          />
        )}

        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              paddingBottom: Math.max(botPad, 10) + 4,
            },
          ]}
        >
          <View
            style={[
              styles.inputBox,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
          >
            <TextInput
              ref={inputRef}
              style={[styles.textInput, { color: colors.foreground }]}
              placeholder="Message…"
              placeholderTextColor={colors.mutedForeground}
              value={text}
              onChangeText={setText}
              multiline
              returnKeyType="default"
            />
          </View>
          <TouchableOpacity
            style={[
              styles.sendBtn,
              {
                backgroundColor: text.trim() ? colors.primary : colors.muted,
              },
            ]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Feather
                name="send"
                size={17}
                color={text.trim() ? "#fff" : colors.mutedForeground}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
    minHeight: HEADER_HEIGHT,
  },
  backBtn: { padding: 6, borderRadius: 10 },
  headerUser: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerUserText: { flex: 1, gap: 1 },
  headerName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  headerUsername: { fontSize: 12, fontFamily: "Inter_400Regular" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  msgList: { padding: 14, gap: 3, flexGrow: 1, paddingBottom: 8 },
  msgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    marginBottom: 2,
  },
  msgRowMine: { flexDirection: "row-reverse" },
  avatarSlot: { width: 28, alignItems: "center", justifyContent: "flex-end" },
  bubble: {
    maxWidth: "74%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    gap: 2,
  },
  bubbleTailRight: { borderBottomRightRadius: 5 },
  bubbleTailLeft: { borderBottomLeftRadius: 5 },
  bubbleText: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 21 },
  bubbleTime: { fontSize: 10, fontFamily: "Inter_400Regular", alignSelf: "flex-end" },
  emptyMsg: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 10,
  },
  emptyMsgIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyMsgText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  emptyMsgSub: { fontSize: 14, fontFamily: "Inter_400Regular" },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  inputBox: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 120,
    minHeight: 46,
  },
  textInput: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
});
