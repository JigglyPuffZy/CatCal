import { Pressable, ViewStyle } from "react-native";
import { Plus, LucideIcon } from "lucide-react-native";
import { colors, shadows } from "../theme";

type FloatingActionButtonProps = {
  onPress?: () => void;
  icon?: LucideIcon;
  className?: string;
  style?: ViewStyle;
};

export function FloatingActionButton({
  onPress,
  icon: Icon = Plus,
  className = "",
  style,
}: FloatingActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[shadows.fab, style]}
      className={`absolute bottom-8 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary active:opacity-90 ${className}`}
    >
      <Icon size={26} color={colors.white} strokeWidth={2.4} />
    </Pressable>
  );
}
