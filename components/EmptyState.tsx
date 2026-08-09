import { Text, View, ViewStyle } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { colors } from "../theme";
import { PrimaryButton } from "./PrimaryButton";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  style?: ViewStyle;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
  style,
}: EmptyStateProps) {
  return (
    <View
      style={style}
      className={`items-center justify-center px-8 py-16 ${className}`}
    >
      {Icon ? (
        <View className="mb-6 h-16 w-16 items-center justify-center rounded-3xl bg-accent/20">
          <Icon size={28} color={colors.primary} strokeWidth={2} />
        </View>
      ) : null}
      <Text className="text-center text-title font-semibold text-text">
        {title}
      </Text>
      {description ? (
        <Text className="mt-2 text-center text-body text-secondary">
          {description}
        </Text>
      ) : null}
      {actionLabel ? (
        <PrimaryButton
          label={actionLabel}
          onPress={onAction}
          className="mt-8 w-full"
        />
      ) : null}
    </View>
  );
}
