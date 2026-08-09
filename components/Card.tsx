import { View, ViewProps, ViewStyle } from "react-native";
import { shadows } from "../theme";

type CardPadding = "none" | "sm" | "md" | "lg";

type CardProps = ViewProps & {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
  elevated?: boolean;
  padding?: CardPadding;
};

const paddingMap: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({
  children,
  className = "",
  style,
  elevated = true,
  padding = "lg",
  ...props
}: CardProps) {
  return (
    <View
      {...props}
      style={[elevated ? shadows.soft : undefined, style]}
      className={`rounded-3xl bg-card ${paddingMap[padding]} ${className}`}
    >
      {children}
    </View>
  );
}
