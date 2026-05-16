import React from "react";
import { View, Text, Image } from "react-native";

const AVATAR_COLORS = [
  "#0096B4", "#7C3AED", "#059669", "#D97706",
  "#DC2626", "#2563EB", "#DB2777", "#0891B2",
];

function colorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface AvatarProps {
  uri?: string;
  name: string;
  size?: number;
}

export const Avatar = React.memo(function Avatar({ uri, name, size = 44 }: AvatarProps) {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const bgColor = colorFromName(name || "?");
  const fontSize = size * 0.36;

  if (uri) {
    return (
      <View style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden" }}>
        <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="cover" />
      </View>
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bgColor + "22",
        borderWidth: 1.5,
        borderColor: bgColor + "55",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize, fontFamily: "Inter_700Bold", color: bgColor }}>
        {initials}
      </Text>
    </View>
  );
});
