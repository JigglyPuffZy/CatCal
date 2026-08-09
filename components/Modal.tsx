import {
  Modal as RNModal,
  Pressable,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { X } from "lucide-react-native";
import { colors, shadows } from "../theme";

type ModalProps = {
  visible: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
  showCloseButton?: boolean;
};

export function Modal({
  visible,
  onClose,
  title,
  children,
  className = "",
  style,
  showCloseButton = true,
}: ModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/45 px-6">
        {onClose ? (
          <Pressable className="absolute inset-0" onPress={onClose} />
        ) : null}
        <View
          style={[shadows.medium, style]}
          className={`w-full rounded-3xl bg-card p-6 ${className}`}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="flex-1 pr-4 text-title font-semibold text-text">
              {title}
            </Text>
            {showCloseButton && onClose ? (
              <Pressable
                onPress={onClose}
                className="h-10 w-10 items-center justify-center rounded-full bg-background active:opacity-80"
              >
                <X size={18} color={colors.secondaryText} />
              </Pressable>
            ) : null}
          </View>
          {children}
        </View>
      </View>
    </RNModal>
  );
}
