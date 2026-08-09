import { Image, Text, View, ViewStyle } from "react-native";
import { colors } from "../theme";

type AvatarProps = {
  uri?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  style?: ViewStyle;
};

const sizeMap = {
  sm: { box: "h-10 w-10", text: "text-caption", px: 40 },
  md: { box: "h-14 w-14", text: "text-body", px: 56 },
  lg: { box: "h-20 w-20", text: "text-title", px: 80 },
  xl: { box: "h-28 w-28", text: "text-heading", px: 112 },
} as const;

export function Avatar({
  uri,
  name = "",
  size = "md",
  className = "",
  style,
}: AvatarProps) {
  const config = sizeMap[size];
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View
      style={[{ borderRadius: config.px / 2 }, style]}
      className={`items-center justify-center overflow-hidden bg-accent/25 ${config.box} ${className}`}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: config.px, height: config.px }}
          resizeMode="cover"
        />
      ) : (
        <Text className={`font-semibold text-primary ${config.text}`}>
          {initials || "C"}
        </Text>
      )}
      {!uri ? (
        <View
          pointerEvents="none"
          className="absolute inset-0 border border-border"
          style={{ borderRadius: config.px / 2, borderColor: colors.border }}
        />
      ) : null}
    </View>
  );
}
