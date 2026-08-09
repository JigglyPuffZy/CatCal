import { Text, View, ViewStyle } from "react-native";
import { Card } from "./Card";
import { colors } from "../theme";

export type ChartPoint = {
  label: string;
  value: number;
};

type ChartCardProps = {
  title: string;
  subtitle?: string;
  data: ChartPoint[];
  unit?: string;
  className?: string;
  style?: ViewStyle;
};

export function ChartCard({
  title,
  subtitle,
  data,
  unit = "",
  className = "",
  style,
}: ChartCardProps) {
  const max = Math.max(...data.map((point) => point.value), 1);

  return (
    <Card className={className} style={style}>
      <Text className="text-title font-semibold text-text">{title}</Text>
      {subtitle ? (
        <Text className="mt-1 text-caption text-secondary">{subtitle}</Text>
      ) : null}
      <View className="mt-6 h-40 flex-row items-end justify-between">
        {data.map((point) => {
          const height = Math.max((point.value / max) * 100, 8);
          return (
            <View key={point.label} className="mx-1 flex-1 items-center">
              <Text className="mb-2 text-[11px] font-medium text-secondary">
                {point.value}
                {unit}
              </Text>
              <View className="h-28 w-full justify-end overflow-hidden rounded-2xl bg-background">
                <View
                  className="w-full rounded-2xl bg-primary"
                  style={{
                    height: `${height}%`,
                    backgroundColor: colors.primary,
                  }}
                />
              </View>
              <Text className="mt-2 text-[11px] font-medium text-secondary">
                {point.label}
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}
