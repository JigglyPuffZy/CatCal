export const lightColors = {
  primary: "#3BB273",
  accent: "#5CD68C",
  background: "#EEF2F7",
  backgroundAlt: "#F8FAFC",
  card: "#FFFFFF",
  glass: "rgba(255, 255, 255, 0.72)",
  glassBorder: "rgba(255, 255, 255, 0.85)",
  text: "#111827",
  secondaryText: "#6B7280",
  border: "rgba(15, 23, 42, 0.08)",
  white: "#FFFFFF",
  black: "#000000",
  danger: "#EF4444",
  warning: "#F59E0B",
  success: "#3BB273",
  overlay: "rgba(17, 24, 39, 0.45)",
  orbPrimary: "rgba(59, 178, 115, 0.22)",
  orbAccent: "rgba(92, 214, 140, 0.18)",
  tabBar: "rgba(255, 255, 255, 0.82)",
} as const;

export const darkColors = {
  primary: "#5CD68C",
  accent: "#3BB273",
  background: "#070B10",
  backgroundAlt: "#0B1018",
  card: "rgba(255, 255, 255, 0.07)",
  glass: "rgba(15, 23, 42, 0.55)",
  glassBorder: "rgba(255, 255, 255, 0.12)",
  text: "#F3F4F6",
  secondaryText: "#9CA3AF",
  border: "rgba(255, 255, 255, 0.1)",
  white: "#FFFFFF",
  black: "#000000",
  danger: "#F87171",
  warning: "#FBBF24",
  success: "#5CD68C",
  overlay: "rgba(0, 0, 0, 0.6)",
  orbPrimary: "rgba(92, 214, 140, 0.14)",
  orbAccent: "rgba(59, 178, 115, 0.1)",
  tabBar: "rgba(11, 16, 24, 0.88)",
} as const;

export type ThemeColors = {
  primary: string;
  accent: string;
  background: string;
  backgroundAlt: string;
  card: string;
  glass: string;
  glassBorder: string;
  text: string;
  secondaryText: string;
  border: string;
  white: string;
  black: string;
  danger: string;
  warning: string;
  success: string;
  overlay: string;
  orbPrimary: string;
  orbAccent: string;
  tabBar: string;
};

/** @deprecated Use `useTheme().colors` for theme-aware colors. */
export const colors = lightColors;

export function getThemeColors(isDark: boolean): ThemeColors {
  return isDark ? darkColors : lightColors;
}
