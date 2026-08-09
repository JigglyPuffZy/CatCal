import { useRef, useState } from "react";
import { Alert, Text, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Lock, Mail, KeyRound } from "lucide-react-native";
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
import { getRouteParam } from "../lib/routeParams";
import { useResponsiveLayout } from "../theme";

export function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    email?: string | string[];
    code?: string | string[];
  }>();
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const { horizontalPadding, scrollBottomPadding, contentMaxWidth } =
    useResponsiveLayout();

  const [email, setEmail] = useState(() => getRouteParam(params.email) ?? "");
  const [code, setCode] = useState(() => getRouteParam(params.code) ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !code.trim() || !password) {
      Alert.alert("Missing fields", "Fill in email, code, and new password.");
      return;
    }
    if (!/^\d{6}$/.test(code.trim())) {
      Alert.alert("Invalid code", "Enter the 6-digit code from your email.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Use at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords don't match", "Confirm password must match.");
      return;
    }

    setLoading(true);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    try {
      const result = await api.resetPassword(email.trim(), code.trim(), password);
      Alert.alert("Password updated", result.message, [
        { text: "Sign in", onPress: () => router.replace("/login") },
      ]);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Could not reset password.";
      Alert.alert("Reset failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground>
      <LoadingOverlay
        visible={loading}
        message="Updating password…"
        hint="Please wait a moment."
      />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <NavigationBar
          title="New password"
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
            title="Choose a new password"
            subtitle="Enter the 6-digit code we sent to your email."
            className="mb-8"
          />

          <Card padding="md" className="border border-border/60">
            <Text className="mb-5 text-title font-semibold text-text">
              Reset details
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
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              containerClassName="mb-4"
            />
            <AuthInput
              label="6-digit code"
              placeholder="123456"
              icon={KeyRound}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              containerClassName="mb-4"
            />
            <AuthInput
              ref={passwordRef}
              label="New password"
              placeholder="At least 6 characters"
              icon={Lock}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
              containerClassName="mb-4"
            />
            <AuthInput
              ref={confirmRef}
              label="Confirm password"
              placeholder="Re-enter password"
              icon={Lock}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              containerClassName="mb-6"
            />

            <PrimaryButton
              label="Update password"
              loadingLabel="Saving…"
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
