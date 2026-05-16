import React from "react";

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
      <div style={{ width: size, height: size, borderRadius: '50%', overflow: "hidden" }}>
        <img src={uri} alt={name} style={{ width: '100%', height: '100%', objectFit: "cover" }} />
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: bgColor + "22",
        border: `1.5px solid ${bgColor}55`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span style={{ fontSize, fontWeight: "700", color: bgColor }}>
        {initials}
      </span>
    </div>
  );
});
