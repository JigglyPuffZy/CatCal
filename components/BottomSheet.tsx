import {
  Modal as RNModal,
  Pressable,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { shadows } from "../theme";

type BottomSheetProps = {
  visible: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
};

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  className = "",
  style,
}: BottomSheetProps) {
  return (
    <RNModal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/40">
        {onClose ? (
          <Pressable
            className="absolute inset-0"
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          />
        ) : null}
        <View
          style={[shadows.medium, style]}
          className={`rounded-t-3xl bg-card px-6 pb-10 pt-4 ${className}`}
        >
          <View className="mb-4 items-center">
            <View className="h-1.5 w-12 rounded-full bg-border" />
          </View>
          {title ? (
            <Text className="mb-4 text-title font-semibold text-text">
              {title}
            </Text>
          ) : null}
          {children}
        </View>
      </View>
    </RNModal>
  );
}
