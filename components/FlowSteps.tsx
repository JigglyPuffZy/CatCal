import { Text, View, ViewStyle } from "react-native";
import { Check } from "lucide-react-native";
import { useTheme } from "../theme/ThemeProvider";
import { useFormFieldStyles } from "../theme/formFieldStyles";

type FlowStepsProps = {
  steps: readonly string[];
  currentStep: number;
  className?: string;
  style?: ViewStyle;
};

export function FlowSteps({
  steps,
  currentStep,
  className = "",
  style,
}: FlowStepsProps) {
  const { colors } = useTheme();
  const { progressTrack } = useFormFieldStyles();
  const currentLabel = steps[currentStep - 1] ?? steps[0];
  const progress = Math.min(currentStep / steps.length, 1);

  return (
    <View
      className={`mb-6 rounded-2xl px-4 py-3.5 ${className}`}
      style={[
        {
          backgroundColor: colors.glass,
          borderWidth: 1,
          borderColor: colors.glassBorder,
        },
        style,
      ]}
    >
      <View className="mb-3 flex-row items-center justify-between gap-3">
        <Text style={{ color: colors.text, fontSize: 13, fontWeight: "600" }}>
          Step {currentStep} of {steps.length}
        </Text>
        <Text
          style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}
          numberOfLines={1}
        >
          {currentLabel}
        </Text>
      </View>

      <View
        style={{
          height: 6,
          borderRadius: 999,
          overflow: "hidden",
          backgroundColor: progressTrack,
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            borderRadius: 999,
            backgroundColor: colors.primary,
          }}
        />
      </View>

      <View className="mt-3.5 flex-row">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const done = stepNumber < currentStep;
          const active = stepNumber === currentStep;

          return (
            <View key={label} className="flex-1 items-center px-0.5">
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    done || active ? colors.primary : progressTrack,
                }}
              >
                {done ? (
                  <Check size={13} color={colors.white} strokeWidth={3} />
                ) : (
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: active ? colors.white : colors.secondaryText,
                    }}
                  >
                    {stepNumber}
                  </Text>
                )}
              </View>
              <Text
                numberOfLines={1}
                style={{
                  marginTop: 4,
                  fontSize: 9,
                  fontWeight: active ? "600" : "500",
                  color: active ? colors.primary : colors.secondaryText,
                  textAlign: "center",
                }}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
