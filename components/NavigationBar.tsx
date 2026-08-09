import { Pressable, Text, View, ViewStyle } from "react-native";
import { ChevronLeft, LucideIcon } from "lucide-react-native";
import { useTheme } from "../theme/ThemeProvider";

type NavigationBarProps = {
  title: string;
  onBack?: () => void;
  rightLabel?: string;
  onRightPress?: () => void;
  rightIcon?: LucideIcon;
  className?: string;
  style?: ViewStyle;
};

export function NavigationBar({
  title,
  onBack,
  rightLabel,
  onRightPress,
  rightIcon: RightIcon,
  className = "",
  style,
}: NavigationBarProps) {
  const { colors } = useTheme();

  return (
    <View
      style={style}
      className={`mb-2 h-12 flex-row items-center justify-between ${className}`}
    >
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="h-11 w-11 items-center justify-center rounded-full active:opacity-80"
          style={{
            backgroundColor: colors.glass,
            borderWidth: 1,
            borderColor: colors.glassBorder,
          }}
        >
          <ChevronLeft size={22} color={colors.text} />
        </Pressable>
      ) : (
        <View className="h-11 w-11" />
      )}
      <Text
        className="text-body font-semibold"
        style={{ color: colors.text }}
        numberOfLines={1}
      >
        {title}
      </Text>
      {rightLabel || RightIcon ? (
        <Pressable
          onPress={onRightPress}
          className="h-11 min-w-11 items-center justify-center rounded-full px-3 active:opacity-80"
        >
          {RightIcon ? (
            <RightIcon size={20} color={colors.primary} />
          ) : (
            <Text
              className="text-caption font-semibold"
              style={{ color: colors.primary }}
            >
              {rightLabel}
            </Text>
          )}
        </Pressable>
      ) : (
        <View className="h-11 w-11" />
      )}
    </View>
  );
}
