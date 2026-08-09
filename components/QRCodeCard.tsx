import { useRef } from "react";
import { Text, View, ViewStyle } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useTheme } from "../theme/ThemeProvider";

type QRCodeCardProps = {
  value: string;
  title?: string;
  subtitle?: string;
  size?: number;
  className?: string;
  style?: ViewStyle;
  onQrRef?: (ref: { toDataURL: (callback: (data: string) => void) => void }) => void;
};

export function QRCodeCard({
  value,
  title = "Cat QR Code",
  subtitle = "Scan to open this cat's profile",
  size = 180,
  className = "",
  style,
  onQrRef,
}: QRCodeCardProps) {
  const { colors } = useTheme();

  return (
    <View className={`items-center ${className}`} style={style}>
      {title ? (
        <Text style={{ marginBottom: 4, color: colors.text, fontSize: 20, fontWeight: "600" }}>
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text
          style={{
            marginBottom: 24,
            textAlign: "center",
            color: colors.secondaryText,
            fontSize: 13,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
      <View
        className="rounded-3xl p-5"
        style={{
          backgroundColor: colors.white,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <QRCode
          value={value}
          size={size}
          color="#111827"
          backgroundColor={colors.white}
          getRef={onQrRef}
        />
      </View>
      <Text
        style={{
          marginTop: 16,
          textAlign: "center",
          color: colors.secondaryText,
          fontSize: 13,
        }}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}
