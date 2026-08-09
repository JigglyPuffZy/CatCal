import { View, ViewStyle } from "react-native";
import { Cat } from "lucide-react-native";
import { colors, shadows } from "../theme";

type AppMarkProps = {
  size?: "sm" | "md" | "lg";
  /** Exact square card size in px (overrides preset size). */
  boxSize?: number;
  style?: ViewStyle;
};

const SIZES = {
  sm: { box: 56, icon: 28, radius: 14 },
  md: { box: 72, icon: 36, radius: 16 },
  lg: { box: 112, icon: 52, radius: 18 },
} as const;

/** Coded CatCal mark — green square card with cat icon. */
export function AppMark({ size = "md", boxSize, style }: AppMarkProps) {
  const preset = SIZES[size];
  const box = boxSize ?? preset.box;
  const icon = boxSize ? Math.round(box * 0.46) : preset.icon;
  const radius = boxSize ? Math.round(box * 0.16) : preset.radius;
  const inset = Math.max(8, Math.round(box * 0.09));

  return (
    <View
      className="items-center justify-center bg-primary"
      style={[
        shadows.medium,
        {
          width: box,
          height: box,
          borderRadius: radius,
          borderWidth: 2,
          borderColor: "rgba(255,255,255,0.35)",
          shadowColor: colors.primary,
          shadowOpacity: 0.32,
        },
        style,
      ]}
    >
      <View
        className="absolute border border-white/25 bg-white/10"
        style={{
          width: box - inset,
          height: box - inset,
          borderRadius: Math.max(8, radius - 4),
        }}
      />
      <Cat size={icon} color={colors.white} strokeWidth={1.7} />
    </View>
  );
}
