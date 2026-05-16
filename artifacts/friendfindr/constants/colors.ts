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
    text: "#E8EDF5",
    tint: "#00D4E8",

    background: "#090F1A",
    foreground: "#E8EDF5",

    card: "#111827",
    cardForeground: "#E8EDF5",

    primary: "#00C4D8",
    primaryForeground: "#090F1A",

    secondary: "#1A2640",
    secondaryForeground: "#E8EDF5",

    muted: "#1A2640",
    mutedForeground: "#8898B8",

    accent: "#00D4E8",
    accentForeground: "#090F1A",

    destructive: "#FC8181",
    destructiveForeground: "#090F1A",

    border: "#1E2D48",
    input: "#1E2D48",

    success: "#34D399",
    warning: "#FBBF24",

    navBar: "#111827",
    statusBar: "light" as const,
  },

  radius: 14,
};

export default colors;
