import { ReactNode } from "react";
import { Platform, View, ViewProps, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "../theme/ThemeProvider";

type GlassCardPadding = "none" | "sm" | "md" | "lg";

type GlassCardProps = ViewProps & {
  children: ReactNode;
  padding?: GlassCardPadding;
  intensity?: number;
  /** Outer wrapper — use for margins (mb-5, mt-4, etc.) */
  className?: string;
  /** Inner content — use for alignment (items-center, etc.) */
  contentClassName?: string;
  style?: ViewStyle;
};

const paddingMap: Record<GlassCardPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function GlassCard({
  children,
  padding = "md",
  intensity = Platform.OS === "ios" ? 55 : 40,
  className = "",
  contentClassName = "",
  style,
  ...props
}: GlassCardProps) {
  const { isDark, colors } = useTheme();

  return (
    <View
      {...props}
      className={`w-full overflow-hidden rounded-3xl ${className}`}
      style={[
        {
          borderWidth: 1,
          borderColor: colors.glassBorder,
        },
        style,
      ]}
    >
      <BlurView
        intensity={intensity}
        tint={isDark ? "dark" : "light"}
        style={{ width: "100%" }}
      >
        <View
          className={`${paddingMap[padding]} ${contentClassName}`}
          style={{
            backgroundColor: colors.glass,
          }}
        >
          {children}
        </View>
      </BlurView>
    </View>
  );
}
