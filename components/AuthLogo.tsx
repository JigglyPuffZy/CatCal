import { Text, View, ViewStyle } from "react-native";
import { AppMark } from "./AppMark";
import { APP_NAME } from "../constants";

type AuthLogoProps = {
  size?: "md" | "lg";
  showTagline?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
  style?: ViewStyle;
};

export function AuthLogo({
  size = "md",
  showTagline = true,
  title,
  subtitle,
  className = "",
  style,
}: AuthLogoProps) {
  const isLarge = size === "lg";

  return (
    <View className={`items-center ${className}`} style={style}>
      <AppMark size={isLarge ? "lg" : "md"} />

      <Text
        className={`mt-5 text-center font-bold text-text ${
          isLarge ? "text-display" : "text-heading"
        }`}
        accessibilityRole="header"
      >
        {title ?? APP_NAME}
      </Text>

      {showTagline ? (
        <Text className="mt-2 max-w-[280px] text-center text-body leading-6 text-secondary">
          {subtitle ?? "Smart nutrition for your cats"}
        </Text>
      ) : null}
    </View>
  );
}
