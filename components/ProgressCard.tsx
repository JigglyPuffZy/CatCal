import { Text, View, ViewStyle } from "react-native";
import { Card } from "./Card";
import { colors } from "../theme";

type ProgressCardProps = {
  title: string;
  subtitle?: string;
  progress: number;
  valueLabel?: string;
  className?: string;
  style?: ViewStyle;
};

export function ProgressCard({
  title,
  subtitle,
  progress,
  valueLabel,
  className = "",
  style,
}: ProgressCardProps) {
  const clamped = Math.max(0, Math.min(progress, 1));

  return (
    <Card className={className} style={style} padding="md">
      <View className="mb-4 flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-title font-semibold text-text" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="mt-1 text-caption text-secondary" numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {valueLabel ? (
          <View className="rounded-full bg-accent/20 px-3 py-1.5">
            <Text className="text-caption font-semibold text-primary">
              {valueLabel}
            </Text>
          </View>
        ) : null}
      </View>
      <View
        className="h-3 overflow-hidden rounded-full bg-background"
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      >
        <View
          className="h-full rounded-full"
          style={{
            width: `${clamped * 100}%`,
            backgroundColor: colors.primary,
          }}
        />
      </View>
    </Card>
  );
}
