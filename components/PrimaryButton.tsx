import { ActivityIndicator, Pressable, Text, View, ViewStyle } from "react-native";
import { colors, shadows, TOUCH_TARGET } from "../theme";
import { PressableScale } from "./PressableScale";

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  className?: string;
  style?: ViewStyle;
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  loadingLabel,
  className = "",
  style,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  const activeLabel = loading ? (loadingLabel ?? label) : label;

  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      style={[shadows.soft, { minHeight: TOUCH_TARGET + 12 }, style]}
      className={`w-full items-center justify-center rounded-2xl bg-primary px-6 py-4 ${
        isDisabled ? "opacity-70" : ""
      } ${className}`}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={activeLabel}
    >
      {loading ? (
        <View className="flex-row items-center justify-center">
          <ActivityIndicator color={colors.white} size="small" />
          <Text className="ml-3 text-center text-base font-semibold text-white">
            {activeLabel}
          </Text>
        </View>
      ) : (
        <Text className="text-center text-base font-semibold text-white">{label}</Text>
      )}
    </PressableScale>
  );
}
