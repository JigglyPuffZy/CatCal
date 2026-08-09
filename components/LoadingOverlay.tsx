import { ActivityIndicator, Modal, Text, View } from "react-native";
import { AppMark } from "./AppMark";
import { useTheme } from "../theme/ThemeProvider";

type LoadingOverlayProps = {
  visible: boolean;
  message?: string;
  hint?: string;
};

export function LoadingOverlay({
  visible,
  message = "Loading…",
  hint,
}: LoadingOverlayProps) {
  const { colors } = useTheme();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      accessibilityViewIsModal
      accessibilityLabel={message}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(15, 23, 42, 0.45)",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 32,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 300,
            alignItems: "center",
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.glassBorder,
            backgroundColor: colors.card,
            paddingHorizontal: 28,
            paddingVertical: 32,
          }}
        >
          <AppMark size="sm" style={{ marginBottom: 20 }} />
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={{
              marginTop: 18,
              textAlign: "center",
              color: colors.text,
              fontSize: 17,
              fontWeight: "600",
            }}
          >
            {message}
          </Text>
          {hint ? (
            <Text
              style={{
                marginTop: 8,
                textAlign: "center",
                color: colors.secondaryText,
                fontSize: 14,
                lineHeight: 20,
              }}
            >
              {hint}
            </Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

type LoadingViewProps = {
  message?: string;
  hint?: string;
};

/** Full-screen loading state (e.g. while syncing data). */
export function LoadingView({
  message = "Loading…",
  hint,
}: LoadingViewProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        paddingHorizontal: 32,
      }}
    >
      <View
        style={{
          width: "100%",
          maxWidth: 300,
          alignItems: "center",
          borderRadius: 24,
          borderWidth: 1,
          borderColor: colors.glassBorder,
          backgroundColor: colors.card,
          paddingHorizontal: 28,
          paddingVertical: 32,
        }}
      >
        <AppMark size="sm" style={{ marginBottom: 20 }} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={{
            marginTop: 18,
            textAlign: "center",
            color: colors.text,
            fontSize: 17,
            fontWeight: "600",
          }}
        >
          {message}
        </Text>
        {hint ? (
          <Text
            style={{
              marginTop: 8,
              textAlign: "center",
              color: colors.secondaryText,
              fontSize: 14,
              lineHeight: 20,
            }}
          >
            {hint}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
