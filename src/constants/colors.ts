const colors = {
  light: {
    text: "#0F1B2D",
    tint: "#0096B4",

    background: "#F4F7FB",
    foreground: "#0F1B2D",

    card: "#FFFFFF",
    cardForeground: "#0F1B2D",

    primary: "#0096B4",
    primaryForeground: "#FFFFFF",

    secondary: "#E8F4F8",
    secondaryForeground: "#0F1B2D",

    muted: "#EEF2F7",
    mutedForeground: "#6B7A99",

    accent: "#00D4E8",
    accentForeground: "#0F1B2D",

    destructive: "#E53E3E",
    destructiveForeground: "#FFFFFF",

    border: "#DDE4EF",
    input: "#DDE4EF",

    success: "#10B981",
    warning: "#F59E0B",

    navBar: "#FFFFFF",
    statusBar: "dark" as const,
  },

  dark: {
    text: "#FFFFFF",
    tint: "#00D4E8",

    background: "#0A1628",
    foreground: "#FFFFFF",

    card: "#121F33",
    cardForeground: "#FFFFFF",

    primary: "#00C4D8",
    primaryForeground: "#0A1628",

    secondary: "#1E2D48",
    secondaryForeground: "#FFFFFF",

    muted: "#1E2D48",
    mutedForeground: "#94A3B8",

    accent: "#00D4E8",
    accentForeground: "#0A1628",

    destructive: "#FC8181",
    destructiveForeground: "#0A1628",

    border: "rgba(255, 255, 255, 0.05)",
    input: "rgba(255, 255, 255, 0.05)",

    success: "#34D399",
    warning: "#FBBF24",

    navBar: "#0A1628",
    statusBar: "light" as const,
  },

  radius: 14,
};

export default colors;
