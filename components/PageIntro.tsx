import { Text, View, ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";

type PageIntroProps = {
  title: string;
  subtitle?: string;
  className?: string;
  style?: ViewStyle;
};

/** Consistent screen title + plain-language subtitle. */
export function PageIntro({ title, subtitle, className = "", style }: PageIntroProps) {
  const { colors } = useTheme();

  return (
    <View className={`mb-6 ${className}`} style={style}>
      <Text
        style={{ color: colors.text, fontSize: 28, fontWeight: "700" }}
        accessibilityRole="header"
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={{
            marginTop: 6,
            color: colors.secondaryText,
            fontSize: 15,
            lineHeight: 22,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
