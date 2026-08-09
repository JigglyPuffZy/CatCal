import { Text, ViewStyle } from "react-native";
import { ScanLine } from "lucide-react-native";
import { colors, shadows, TOUCH_TARGET } from "../theme";
import { PressableScale } from "./PressableScale";

type QRScannerButtonProps = {
  label?: string;
  onPress?: () => void;
  className?: string;
  style?: ViewStyle;
};

export function QRScannerButton({
  label = "Scan QR Code",
  onPress,
  className = "",
  style,
}: QRScannerButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      style={[shadows.soft, { minHeight: TOUCH_TARGET + 12 }, style]}
      className={`w-full flex-row items-center justify-center rounded-2xl bg-primary px-6 py-4 active:opacity-90 ${className}`}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <ScanLine size={20} color={colors.white} strokeWidth={2.2} />
      <Text className="ml-2 text-base font-semibold text-white">{label}</Text>
    </PressableScale>
  );
}
