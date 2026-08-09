import { ReactNode } from "react";
import {
  ScrollView,
  ScrollViewProps,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useResponsiveLayout } from "../theme";
import { useTheme } from "../theme/ThemeProvider";

type ScreenContainerProps = {
  children: ReactNode;
  scrollable?: boolean;
  className?: string;
  contentClassName?: string;
  style?: ViewStyle;
  scrollProps?: Omit<ScrollViewProps, "children">;
  showBackground?: boolean;
};

export function ScreenContainer({
  children,
  scrollable = true,
  contentClassName = "",
  style,
  scrollProps,
  showBackground = true,
}: ScreenContainerProps) {
  const { horizontalPadding, scrollBottomPadding, contentMaxWidth } =
    useResponsiveLayout();
  const { colors } = useTheme();

  const content = (
    <View
      style={{
        width: "100%",
        maxWidth: contentMaxWidth,
        alignSelf: "center",
        paddingHorizontal: horizontalPadding,
        paddingBottom: scrollBottomPadding,
      }}
      className={contentClassName}
    >
      {children}
    </View>
  );

  const background = showBackground ? (
    <>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -80,
          right: -60,
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: colors.orbPrimary,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 120,
          left: -90,
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: colors.orbAccent,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: 80,
          right: -40,
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: colors.orbPrimary,
          opacity: 0.7,
        }}
      />
    </>
  ) : null;

  const body = scrollable ? (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      {...scrollProps}
    >
      {content}
    </ScrollView>
  ) : (
    content
  );

  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: colors.background }, style]}
      edges={["top"]}
    >
      {background}
      {body}
    </SafeAreaView>
  );
}
