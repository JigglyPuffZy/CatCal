import { ActivityIndicator, Pressable, Text, View, ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { TOUCH_TARGET } from "../theme";

type SecondaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  className?: string;
  style?: ViewStyle;
};

export function SecondaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  loadingLabel,
  className = "",
  style,
}: SecondaryButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;
  const activeLabel = loading ? (loadingLabel ?? label) : label;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        {
          height: TOUCH_TARGET + 12,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.glass,
          paddingHorizontal: 24,
          opacity: isDisabled ? 0.7 : 1,
        },
        style,
      ]}
      className={`w-full active:opacity-80 ${className}`}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={activeLabel}
    >
      {loading ? (
        <View className="flex-row items-center justify-center">
          <ActivityIndicator color={colors.primary} size="small" />
          <Text
            className="ml-3 text-base font-semibold"
            style={{ color: colors.text }}
          >
            {activeLabel}
          </Text>
        </View>
      ) : (
        <Text className="text-base font-semibold" style={{ color: colors.text }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
