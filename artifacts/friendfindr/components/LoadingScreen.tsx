import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export function LoadingScreen() {
  return (
    <LinearGradient colors={["#0A1628", "#0F2040", "#111827"]} style={styles.container}>
      <View style={styles.logoBox}>
        <Text style={styles.logoLetter}>F</Text>
      </View>
      <Text style={styles.brand}>FriendFindr</Text>
      <ActivityIndicator color="#00C4D8" style={{ marginTop: 40 }} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#00C4D8",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00C4D8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 4,
  },
  logoLetter: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  brand: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
});
