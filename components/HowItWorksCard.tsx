import { Text, View, ViewStyle } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { useTheme } from "../theme/ThemeProvider";

export type HowItWorksStep = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type HowItWorksCardProps = {
  steps: HowItWorksStep[];
  title?: string;
  className?: string;
  style?: ViewStyle;
};

export function HowItWorksCard({
  steps,
  title = "How CatCal works",
  className = "",
  style,
}: HowItWorksCardProps) {
  const { colors } = useTheme();

  return (
    <View
      className={`rounded-3xl p-5 ${className}`}
      style={[
        {
          backgroundColor: colors.glass,
          borderWidth: 1,
          borderColor: colors.glassBorder,
        },
        style,
      ]}
    >
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700", marginBottom: 16 }}>
        {title}
      </Text>
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <View
            key={step.title}
            className="flex-row"
            style={{ marginBottom: index < steps.length - 1 ? 14 : 0 }}
          >
            <View
              className="mr-3 h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.primary }}
            >
              <Text style={{ color: colors.white, fontSize: 14, fontWeight: "700" }}>
                {index + 1}
              </Text>
            </View>
            <View className="min-w-0 flex-1 pt-0.5">
              <View className="mb-1 flex-row items-center">
                <Icon size={14} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}>
                  {step.title}
                </Text>
              </View>
              <Text style={{ color: colors.secondaryText, fontSize: 13, lineHeight: 19 }}>
                {step.description}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
