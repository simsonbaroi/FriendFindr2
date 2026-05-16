import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Feather.glyphMap;
  isPassword?: boolean;
}

export function InputField({
  label,
  error,
  leftIcon,
  isPassword,
  ...props
}: InputFieldProps) {
  const colors = useColors();
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.destructive
    : focused
    ? colors.primary
    : colors.border;

  return (
    <View style={styles.wrapper}>
      {!!label && (
        <Text
          style={[
            styles.label,
            { color: focused ? colors.primary : colors.mutedForeground },
          ]}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: colors.card,
            borderColor,
            borderWidth: focused || !!error ? 1.5 : 1,
          },
        ]}
      >
        {!!leftIcon && (
          <Feather
            name={leftIcon}
            size={17}
            color={focused ? colors.primary : colors.mutedForeground}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry={isPassword && !showPass}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPass((v) => !v)}
            style={styles.eyeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather
              name={showPass ? "eye-off" : "eye"}
              size={17}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>
        )}
      </View>
      {!!error && (
        <View style={styles.errorRow}>
          <Feather name="alert-circle" size={12} color={colors.destructive} />
          <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    paddingVertical: 0,
  },
  eyeBtn: { paddingLeft: 8 },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  error: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
