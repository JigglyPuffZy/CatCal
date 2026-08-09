import { ReactNode, useMemo } from "react";
import { ScrollView, ViewStyle } from "react-native";

type AuthScreenScrollProps = {
  children: ReactNode;
  horizontalPadding: number;
  bottomPadding: number;
  contentMaxWidth?: number;
  topPadding?: number;
  contentStyle?: ViewStyle;
};

export function AuthScreenScroll({
  children,
  horizontalPadding,
  bottomPadding,
  contentMaxWidth,
  topPadding = 24,
  contentStyle,
}: AuthScreenScrollProps) {
  const containerStyle = useMemo(
    () => ({
      paddingHorizontal: horizontalPadding,
      paddingTop: topPadding,
      paddingBottom: bottomPadding,
      maxWidth: contentMaxWidth,
      width: "100%" as const,
      alignSelf: "center" as const,
      ...contentStyle,
    }),
    [
      horizontalPadding,
      topPadding,
      bottomPadding,
      contentMaxWidth,
      contentStyle,
    ]
  );

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={containerStyle}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="none"
      automaticallyAdjustKeyboardInsets
      nestedScrollEnabled
    >
      {children}
    </ScrollView>
  );
}
