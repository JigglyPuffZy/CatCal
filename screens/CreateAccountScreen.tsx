import { useRef, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Mail,
  Lock,
  UserRound,
  CheckCircle2,
  Utensils,
  QrCode,
  Bell,
} from "lucide-react-native";
import {
  AuthBackground,
  AuthInput,
  AuthScreenScroll,
  Card,
  LegalConsentText,
  Modal,
  NavigationBar,
  LoadingOverlay,
  PrimaryButton,
  SecondaryButton,
} from "../components";
import { APP_NAME } from "../constants";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api/client";
import { colors, shadows, useResponsiveLayout } from "../theme";

const benefits = [
  { icon: Utensils, text: "Daily calorie & portion plans" },
  { icon: QrCode, text: "QR codes for each cat" },
  { icon: Bell, text: "Feeding reminders" },
] as const;

export function CreateAccountScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const { horizontalPadding, scrollBottomPadding, contentMaxWidth } =
    useResponsiveLayout();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleCreateAccount = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert("Missing fields", "Fill in all fields to continue.");
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
      await signUp(fullName.trim(), email.trim(), password);
      setShowSuccessModal(true);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Could not create account.";
      const hint =
        error instanceof ApiError && error.status === 409
          ? " Try signing in instead, or use Forgot password."
          : "";
      Alert.alert("Sign up failed", `${message}${hint}`);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength =
    password.length === 0
      ? 0
      : password.length < 6
        ? 1
        : password.length < 10
          ? 2
          : 3;

  const strengthLabel =
    passwordStrength === 0
      ? " "
      : passwordStrength === 1
        ? "Weak — add more characters"
        : passwordStrength === 2
          ? "Good — almost there"
          : "Strong password";

  return (
    <AuthBackground>
      <LoadingOverlay
        visible={loading}
        message="Creating your account…"
        hint="Setting up your profile. This may take up to a minute."
      />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View
          style={{
            paddingHorizontal: horizontalPadding,
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
          }}
        >
          <NavigationBar
            title="Create Account"
            onBack={() => router.back()}
          />
        </View>

        <AuthScreenScroll
          horizontalPadding={horizontalPadding}
          bottomPadding={scrollBottomPadding}
          contentMaxWidth={contentMaxWidth}
          topPadding={8}
        >
          <Text className="mb-2 text-heading font-bold text-text">
            Join {APP_NAME}
          </Text>
          <Text className="mb-6 text-body leading-6 text-secondary">
            Set up your account in under a minute and start caring for your
            cats with confidence.
          </Text>

          <View className="mb-8 gap-3">
            {benefits.map(({ icon: Icon, text }) => (
              <View
                key={text}
                className="flex-row items-center rounded-2xl border border-border/50 bg-card/90 px-4 py-3.5"
                style={shadows.soft}
              >
                <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-accent/25">
                  <Icon size={18} color={colors.primary} strokeWidth={2.2} />
                </View>
                <Text className="flex-1 text-body text-text">{text}</Text>
                <CheckCircle2 size={18} color={colors.primary} />
              </View>
            ))}
          </View>

          <Card padding="md" className="mb-6 border border-border/60">
            <Text className="mb-5 text-title font-semibold text-text">
              Your details
            </Text>

            <AuthInput
              label="Full name"
              placeholder="Jane Doe"
              icon={UserRound}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoCorrect={false}
              textContentType="name"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              containerClassName="mb-4"
            />
            <AuthInput
              ref={emailRef}
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
              ref={passwordRef}
              label="Password"
              placeholder="At least 8 characters"
              icon={Lock}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              containerClassName="mb-3"
            />

            <View className="mb-4" style={{ minHeight: 36 }}>
              <View className="mb-2 flex-row gap-1.5">
                {[1, 2, 3].map((level) => (
                  <View
                    key={level}
                    className="h-1.5 flex-1 rounded-full"
                    style={{
                      backgroundColor:
                        passwordStrength >= level
                          ? colors.primary
                          : colors.border,
                    }}
                  />
                ))}
              </View>
              <Text className="text-caption text-secondary">{strengthLabel}</Text>
            </View>

            <AuthInput
              ref={confirmPasswordRef}
              label="Confirm password"
              placeholder="Re-enter your password"
              icon={Lock}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleCreateAccount}
              containerClassName="mb-6"
            />

            <PrimaryButton
              label="Create Account"
              loadingLabel="Creating account…"
              onPress={handleCreateAccount}
              loading={loading}
              disabled={loading}
            />
          </Card>

          <View className="flex-row flex-wrap items-center justify-center py-2">
            <Text className="text-body text-secondary">
              Already have an account?{" "}
            </Text>
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
              className="active:opacity-70"
            >
              <Text className="text-body font-semibold text-primary">
                Sign In
              </Text>
            </Pressable>
          </View>

          <LegalConsentText
            prefix="By creating an account, you agree to our"
            className="mt-4"
          />
        </AuthScreenScroll>

        <Modal
          visible={showSuccessModal}
          title="Account created"
          showCloseButton={false}
        >
          <View className="items-center">
            <View
              className="mb-4 h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: `${colors.primary}18` }}
            >
              <CheckCircle2 size={32} color={colors.primary} strokeWidth={2.2} />
            </View>
            <Text
              style={{
                textAlign: "center",
                color: colors.secondaryText,
                fontSize: 15,
                lineHeight: 22,
                marginBottom: 24,
              }}
            >
              Your {APP_NAME} account is ready. You are signed in — add your cats
              and start tracking meals.
            </Text>
            <PrimaryButton
              label="Go to dashboard"
              onPress={() => {
                setShowSuccessModal(false);
                router.replace("/(tabs)");
              }}
            />
            <SecondaryButton
              label="Create another account"
              className="mt-3"
              onPress={() => {
                setShowSuccessModal(false);
                resetForm();
              }}
            />
          </View>
        </Modal>
      </SafeAreaView>
    </AuthBackground>
  );
}
