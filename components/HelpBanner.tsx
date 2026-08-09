import { ReactNode } from "react";
import { Text, View, ViewStyle } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { useTheme } from "../theme/ThemeProvider";

type HelpBannerProps = {
  icon?: LucideIcon;
  title?: string;
  children: ReactNode;
  className?: string;
  style?: ViewStyle;
};

/** Short, friendly info box — use for tips and how-to hints. */
export function HelpBanner({
  icon: Icon,
  title,
  children,
  className = "",
  style,
}: HelpBannerProps) {
  const { colors } = useTheme();

  return (
    <View
      className={`rounded-2xl px-4 py-3.5 ${className}`}
      style={[
        {
          backgroundColor: `${colors.primary}10`,
          borderWidth: 1,
          borderColor: `${colors.primary}28`,
        },
        style,
      ]}
    >
      <View className="flex-row items-start">
        {Icon ? (
          <View
            className="mr-3 mt-0.5 h-8 w-8 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${colors.primary}18` }}
          >
            <Icon size={16} color={colors.primary} />
          </View>
        ) : null}
        <View className="min-w-0 flex-1">
          {title ? (
            <Text
              style={{
                color: colors.text,
                fontSize: 14,
                fontWeight: "700",
                marginBottom: 4,
              }}
            >
              {title}
            </Text>
          ) : null}
          <Text style={{ color: colors.secondaryText, fontSize: 13, lineHeight: 20 }}>
            {children}
          </Text>
        </View>
      </View>
    </View>
  );
}
