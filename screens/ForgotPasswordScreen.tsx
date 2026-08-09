import { useState } from "react";
import { Alert, Text } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail } from "lucide-react-native";
import {
  AuthBackground,
  AuthInput,
  AuthLogo,
  AuthScreenScroll,
  Card,
  LoadingOverlay,
  NavigationBar,
  PrimaryButton,
} from "../components";
import { ApiError, api } from "../lib/api/client";
import { useResponsiveLayout } from "../theme";

export function ForgotPasswordScreen() {
  const router = useRouter();
  const { horizontalPadding, scrollBottomPadding, contentMaxWidth } =
    useResponsiveLayout();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert("Missing email", "Enter the email on your CatCal account.");
      return;
    }

    setLoading(true);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    try {
      const result = await api.forgotPassword(email.trim());
      if (result.devResetCode) {
        Alert.alert(
          "Reset code (dev)",
          `Email is not configured yet. Use this code:\n\n${result.devResetCode}`,
          [
            {
              text: "Enter code",
              onPress: () =>
                router.push({
                  pathname: "/reset-password",
                  params: { email: email.trim(), code: result.devResetCode },
                }),
            },
          ]
        );
        return;
      }

      Alert.alert("Check your email", result.message, [
        {
          text: "Enter code",
          onPress: () =>
            router.push({
              pathname: "/reset-password",
              params: { email: email.trim() },
            }),
        },
      ]);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Could not start password reset.";
      Alert.alert("Request failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground>
      <LoadingOverlay
        visible={loading}
        message="Sending reset code…"
        hint="Please wait while we contact the server."
      />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <NavigationBar
          title="Forgot password"
          onBack={() => router.back()}
          className="px-4"
        />
        <AuthScreenScroll
          horizontalPadding={horizontalPadding}
          bottomPadding={scrollBottomPadding}
          contentMaxWidth={contentMaxWidth}
          topPadding={16}
        >
          <AuthLogo
            size="md"
            title="Reset your password"
            subtitle="We'll send a 6-digit code to your registered email."
            className="mb-8"
          />

          <Card padding="md" className="border border-border/60">
            <Text className="mb-5 text-title font-semibold text-text">
              Account email
            </Text>
            <AuthInput
              label="Email address"
              placeholder="you@example.com"
              icon={Mail}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              containerClassName="mb-6"
            />
            <PrimaryButton
              label="Send reset code"
              loadingLabel="Sending code…"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
            />
          </Card>
        </AuthScreenScroll>
      </SafeAreaView>
    </AuthBackground>
  );
}
