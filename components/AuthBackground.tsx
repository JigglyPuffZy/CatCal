import { ReactNode } from "react";
import { View, ViewStyle } from "react-native";
import { colors } from "../theme";

type AuthBackgroundProps = {
  children: ReactNode;
  className?: string;
  style?: ViewStyle;
};

export function AuthBackground({
  children,
  className = "",
  style,
}: AuthBackgroundProps) {
  return (
    <View className={`flex-1 bg-background ${className}`} style={style}>
      <View
        className="absolute inset-x-0 top-0 h-[420px]"
        style={{ backgroundColor: "#E8F8EF" }}
      />
      <View
        className="absolute inset-x-0 top-[280px] h-[200px]"
        style={{ backgroundColor: colors.background, opacity: 0.6 }}
      />
      <View
        className="absolute -right-16 -top-20 h-64 w-64 rounded-full"
        style={{ backgroundColor: colors.accent, opacity: 0.22 }}
      />
      <View
        className="absolute -left-24 top-1/4 h-52 w-52 rounded-full"
        style={{ backgroundColor: colors.primary, opacity: 0.1 }}
      />
      <View
        className="absolute bottom-32 -right-8 h-36 w-36 rounded-full"
        style={{ backgroundColor: colors.accent, opacity: 0.14 }}
      />
      {children}
    </View>
  );
}
