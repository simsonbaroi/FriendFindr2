import React from "react";
import { useColors } from "../hooks/useColors";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  icon?: React.ReactNode;
  className?: string;
}

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  icon,
  className = "",
}: PrimaryButtonProps) {
  const colors = useColors();

  const getStyle = () => {
    switch (variant) {
      case "secondary":
        return { backgroundColor: colors.secondary, color: colors.secondaryForeground };
      case "outline":
        return { backgroundColor: "transparent", border: `1.5px solid ${colors.border}`, color: colors.foreground };
      case "danger":
        return { backgroundColor: "#EF4444", color: "#FFFFFF" };
      case "ghost":
        return { backgroundColor: "transparent", color: colors.mutedForeground };
      default:
        return { backgroundColor: colors.primary, color: colors.primaryForeground };
    }
  };

  const style = getStyle();

  return (
    <button
      onClick={onPress}
      disabled={disabled || loading}
      className={`flex flex-row items-center justify-center py-3.5 px-6 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale ${className}`}
      style={style}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && <div className="mr-2">{icon}</div>}
          <span className="text-[15px] font-bold tracking-tight">
            {label}
          </span>
        </>
      )}
    </button>
  );
}
