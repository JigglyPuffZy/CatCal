import { Text, View, ViewStyle } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { Card } from "./Card";
import { colors } from "../theme";
import { useResponsiveLayout } from "../theme/responsive";

type StatCardProps = {
  label: string;
  value: string;
  unit?: string;
  icon?: LucideIcon;
  trend?: string;
  elevated?: boolean;
  compact?: boolean;
  className?: string;
  style?: ViewStyle;
};

export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  elevated = true,
  compact,
  className = "",
  style,
}: StatCardProps) {
  const { isCompact } = useResponsiveLayout();
  const isSmall = compact ?? isCompact;

  return (
    <Card
      elevated={elevated}
      className={`min-w-0 flex-1 ${isSmall ? "p-4" : "p-5"} ${className}`}
      style={style}
    >
      <View className="mb-2 flex-row items-start justify-between gap-2">
        <Text
          className="flex-1 text-caption font-medium text-secondary"
          numberOfLines={2}
        >
          {label}
        </Text>
        {Icon ? (
          <View className="h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-accent/20">
            <Icon size={18} color={colors.primary} strokeWidth={2.2} />
          </View>
        ) : null}
      </View>
      <View className="flex-row flex-wrap items-end">
        <Text
          className={`font-bold text-text ${isSmall ? "text-title" : "text-heading"}`}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {value}
        </Text>
        {unit ? (
          <Text className="mb-0.5 ml-1 text-caption text-secondary">
            {unit}
          </Text>
        ) : null}
      </View>
      {trend ? (
        <Text className="mt-2 text-caption text-primary" numberOfLines={1}>
          {trend}
        </Text>
      ) : null}
    </Card>
  );
}
