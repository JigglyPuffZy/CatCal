import { TextStyle, ViewStyle } from "react-native";
import { useTheme } from "./ThemeProvider";

export function useFormFieldStyles() {
  const { colors, isDark } = useTheme();

  const label: TextStyle = {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  };

  const hint: TextStyle = {
    color: colors.secondaryText,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  };

  const input: ViewStyle & TextStyle = {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    backgroundColor: isDark ? "#131921" : colors.card,
    borderWidth: 1,
    borderColor: isDark ? "rgba(255, 255, 255, 0.14)" : colors.border,
  };

  const placeholderColor = isDark ? "#9CA3AF" : colors.secondaryText;
  const progressTrack = isDark ? "rgba(255, 255, 255, 0.14)" : colors.border;

  return { label, hint, input, placeholderColor, progressTrack, colors };
}
