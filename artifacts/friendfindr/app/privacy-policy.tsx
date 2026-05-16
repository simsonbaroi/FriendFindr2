import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

const SUPPORT_EMAIL = "friendfindr.support@gmail.com";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {children}
    </View>
  );
}

function Body({ children }: { children: string }) {
  const colors = useColors();
  return (
    <Text style={[styles.body, { color: colors.mutedForeground }]}>{children}</Text>
  );
}

function Bullet({ text }: { text: string }) {
  const colors = useColors();
  return (
    <View style={styles.bulletRow}>
      <View style={[styles.bulletDot, { backgroundColor: colors.primary }]} />
      <Text style={[styles.bulletText, { color: colors.mutedForeground }]}>{text}</Text>
    </View>
  );
}

export default function PrivacyPolicyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} />

      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 14,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Privacy Policy</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroBadge, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "22" }]}>
          <Feather name="shield" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.heroTitle, { color: colors.primary }]}>Your privacy matters</Text>
            <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
              Effective Date: May 2026
            </Text>
          </View>
        </View>

        <Body>
          FriendFindr ("we," "our," or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect your information when you use the FriendFindr mobile application and related services.{"\n\n"}By using FriendFindr, you agree to the practices described in this Privacy Policy.
        </Body>

        <Section title="1. Information We Collect">
          <Text style={[styles.subheading, { color: colors.foreground }]}>Account Information</Text>
          <Body>When you create an account, we may collect:</Body>
          {["Email address", "Username / display name", "Profile photo", "Biography / about information", "Country or region", "Interests and profile preferences"].map(t => (
            <Bullet key={t} text={t} />
          ))}

          <Text style={[styles.subheading, { color: colors.foreground }]}>User Content</Text>
          <Body>We collect information you voluntarily provide, including:</Body>
          {["Messages sent through the platform", "Connection requests", "Uploaded images or profile content"].map(t => (
            <Bullet key={t} text={t} />
          ))}

          <Text style={[styles.subheading, { color: colors.foreground }]}>Technical Information</Text>
          <Body>We may automatically collect:</Body>
          {["Device type and operating system", "App version", "Crash reports and performance diagnostics", "IP address", "Usage statistics"].map(t => (
            <Bullet key={t} text={t} />
          ))}
        </Section>

        <Section title="2. How We Use Your Information">
          <Body>We use your information to:</Body>
          {[
            "Create and manage user accounts",
            "Provide messaging and social features",
            "Improve app performance and user experience",
            "Personalize content and recommendations",
            "Prevent spam, abuse, and unauthorized activity",
            "Maintain security and platform integrity",
            "Respond to support requests",
          ].map(t => <Bullet key={t} text={t} />)}
          <Body>{"\n"}We do not sell your personal information to third parties.</Body>
        </Section>

        <Section title="3. Authentication and Security">
          <Body>
            FriendFindr uses Firebase Authentication and secure cloud infrastructure to protect user accounts and data.{"\n\n"}Security measures include:
          </Body>
          {["Secure authentication", "Encrypted data transmission", "Access control protections", "Firestore security rules", "Protected cloud infrastructure"].map(t => (
            <Bullet key={t} text={t} />
          ))}
          <Body>{"\n"}While we take reasonable steps to protect your information, no online platform can guarantee complete security.</Body>
        </Section>

        <Section title="4. Messaging Privacy">
          <Body>
            Messages are intended to remain private between participants in a conversation.{"\n\n"}However, we reserve the right to investigate reports of harassment, abuse, spam, fraud, illegal activity, or violations of community guidelines.
          </Body>
        </Section>

        <Section title="5. Profile Visibility">
          <Body>Users may choose whether their profile appears in discovery/search results.{"\n\n"}Public profile information may include:</Body>
          {["Display name", "Profile image", "Country", "Interests", "Bio"].map(t => <Bullet key={t} text={t} />)}
          <Body>{"\n"}Users are responsible for the information they choose to share publicly.</Body>
        </Section>

        <Section title="6. Data Storage">
          <Body>
            Your data may be stored on secure cloud servers provided by trusted third-party infrastructure providers such as Google Firebase.{"\n\n"}Data may be processed and stored in different countries depending on infrastructure availability.
          </Body>
        </Section>

        <Section title="7. Third-Party Services">
          <Body>FriendFindr may use third-party services including:</Body>
          {["Firebase Authentication", "Cloud Firestore", "Firebase Storage", "Analytics and crash reporting tools"].map(t => (
            <Bullet key={t} text={t} />
          ))}
          <Body>{"\n"}These services may collect technical information necessary for app functionality and performance.</Body>
        </Section>

        <Section title="8. Children's Privacy">
          <Body>
            FriendFindr is not intended for children under the age of 13.{"\n\n"}We do not knowingly collect personal information from children under 13. If such information is discovered, we will remove it promptly.
          </Body>
        </Section>

        <Section title="9. Account Deletion">
          <Body>Users may request account deletion at any time.{"\n\n"}Upon deletion:</Body>
          {[
            "Profile information may be removed",
            "Messages and certain records may remain temporarily in backups or logs",
            "Some data may be retained if required for legal, security, or abuse-prevention purposes",
          ].map(t => <Bullet key={t} text={t} />)}
        </Section>

        <Section title="10. Changes to This Policy">
          <Body>
            We may update this Privacy Policy from time to time.{"\n\n"}Changes become effective immediately upon posting the updated policy within the app or associated platforms. Users are encouraged to review this policy periodically.
          </Body>
        </Section>

        <Section title="11. Your Consent">
          <Body>
            By creating an account or using FriendFindr, you consent to the collection and use of information described in this Privacy Policy.
          </Body>
        </Section>

        <View style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.contactIconBox, { backgroundColor: colors.primary + "14" }]}>
            <Feather name="mail" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.contactTitle, { color: colors.foreground }]}>Contact Us</Text>
            <Text style={[styles.contactSub, { color: colors.mutedForeground }]}>
              For support, privacy concerns, or legal inquiries:
            </Text>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=FriendFindr Privacy Inquiry`).catch(
                  () => {}
                )
              }
            >
              <Text style={[styles.contactEmail, { color: colors.primary }]}>{SUPPORT_EMAIL}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
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
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  scroll: { padding: 20, gap: 0 },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  heroTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  heroSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  section: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 20,
    marginTop: 20,
    gap: 8,
    borderTopColor: "rgba(128,128,128,0.15)",
  },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 4 },
  subheading: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginTop: 12, marginBottom: 2 },
  body: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingLeft: 4 },
  bulletDot: { width: 5, height: 5, borderRadius: 3, marginTop: 9 },
  bulletText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  contactCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 28,
  },
  contactIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  contactTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  contactSub: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  contactEmail: { fontSize: 14, fontFamily: "Inter_500Medium", marginTop: 4 },
});
