import { Pressable, Text, View, ViewStyle } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { colors, shadows } from "../theme";

export type TabBarItem = {
  key: string;
  label: string;
  icon: LucideIcon;
};

type TabBarProps = {
  items: TabBarItem[];
  activeKey: string;
  onChange?: (key: string) => void;
  className?: string;
  style?: ViewStyle;
};

export function TabBar({
  items,
  activeKey,
  onChange,
  className = "",
  style,
}: TabBarProps) {
  return (
    <View
      style={[shadows.medium, style]}
      className={`flex-row items-center justify-between rounded-3xl border border-border bg-card px-2 py-2 ${className}`}
    >
      {items.map((item) => {
        const active = item.key === activeKey;
        const Icon = item.icon;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange?.(item.key)}
            className={`min-w-[64px] flex-1 items-center rounded-2xl px-2 py-2 ${
              active ? "bg-accent/20" : ""
            }`}
          >
            <Icon
              size={20}
              color={active ? colors.primary : colors.secondaryText}
              strokeWidth={active ? 2.4 : 2}
            />
            <Text
              className={`mt-1 text-[11px] font-medium ${
                active ? "text-primary" : "text-secondary"
              }`}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
