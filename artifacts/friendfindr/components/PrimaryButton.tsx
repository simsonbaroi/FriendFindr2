import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  style?: ViewStyle;
}

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  style,
}: PrimaryButtonProps) {
  const colors = useColors();

  const bg =
    variant === "secondary"
      ? colors.secondary
      : variant === "ghost"
      ? "transparent"
      : variant === "danger"
      ? colors.destructive
      : colors.primary;

  const fg =
    variant === "secondary"
      ? colors.foreground
      : variant === "ghost"
      ? colors.primary
      : colors.primaryForeground;

  const borderColor =
    variant === "ghost" ? colors.primary : "transparent";

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: variant === "ghost" ? 1.5 : 0,
          opacity: disabled || loading ? 0.6 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.78}
    >
      {loading ? (
        <ActivityIndicator color={fg} size="small" />
      ) : (
        <Text style={[styles.label, { color: fg }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
