import { Pressable, Text, View, ViewStyle } from "react-native";
import { ChevronLeft, LucideIcon } from "lucide-react-native";
import { colors, shadows, TOUCH_TARGET } from "../theme";

type HeaderProps = {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: LucideIcon;
  onRightPress?: () => void;
  className?: string;
  style?: ViewStyle;
};

export function Header({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightIcon: RightIcon,
  onRightPress,
  className = "",
  style,
}: HeaderProps) {
  return (
    <View
      style={style}
      className={`mb-6 flex-row items-start justify-between ${className}`}
    >
      <View className="min-h-11 flex-1 flex-row items-start pr-3">
        {showBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="mr-3 items-center justify-center rounded-full bg-card active:opacity-80"
            style={[{ width: TOUCH_TARGET, height: TOUCH_TARGET }, shadows.soft]}
          >
            <ChevronLeft size={22} color={colors.text} />
          </Pressable>
        ) : null}
        <View className="flex-1">
          {title ? (
            <Text
              className="text-heading font-bold text-text"
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
              accessibilityRole="header"
            >
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text
              className="mt-1 text-caption text-secondary"
              numberOfLines={2}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {RightIcon ? (
        <Pressable
          onPress={onRightPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          className="items-center justify-center rounded-full bg-card active:opacity-80"
          style={[{ width: TOUCH_TARGET, height: TOUCH_TARGET }, shadows.soft]}
        >
          <RightIcon size={20} color={colors.text} />
        </Pressable>
      ) : null}
    </View>
  );
}
