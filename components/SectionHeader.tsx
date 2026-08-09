import { Pressable, Text, View, ViewStyle } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { colors } from "../theme";

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  style?: ViewStyle;
};

export function SectionHeader({
  title,
  actionLabel,
  onAction,
  className = "",
  style,
}: SectionHeaderProps) {
  return (
    <View
      style={style}
      className={`mb-3 flex-row items-center justify-between ${className}`}
    >
      <Text
        className="flex-1 text-title font-semibold text-text"
        numberOfLines={1}
        accessibilityRole="header"
      >
        {title}
      </Text>
      {actionLabel ? (
        <Pressable
          onPress={onAction}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          className="ml-3 min-h-11 flex-row items-center active:opacity-70"
        >
          <Text className="text-caption font-semibold text-primary">
            {actionLabel}
          </Text>
          <ChevronRight size={14} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}
