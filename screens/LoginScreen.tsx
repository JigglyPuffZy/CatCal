import { useRef, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail, Lock } from "lucide-react-native";
import {
  AuthBackground,
  AuthInput,
  AuthLogo,
  AuthScreenScroll,
  Card,
  LegalConsentText,
  LoadingOverlay,
  PrimaryButton,
  SecondaryButton,
} from "../components";
import { useAuth } from "../context/AuthContext";
import { ApiError, wakeServer } from "../lib/api/client";
import { IS_REMOTE_API } from "../lib/api/config";
import { useResponsiveLayout } from "../theme";

export function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const passwordRef = useRef<TextInput>(null);
  const { horizontalPadding, scrollBottomPadding, contentMaxWidth } =
    useResponsiveLayout();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing fields", "Enter your email and password.");
      return;
    }
    setLoading(true);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    try {
      await signIn(email, password);
      router.replace("/(tabs)");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Could not sign in. Try again.";
      Alert.alert("Sign in failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground>
      <LoadingOverlay
        visible={loading}
        message="Signing in…"
        hint={
          IS_REMOTE_API
            ? "Connecting to the server. First login after idle may take up to a minute."
            : "Connecting to your account. This may take a few seconds."
        }
      />
      <SafeAreaView style={{ flex: 1 }}>
        <AuthScreenScroll
          horizontalPadding={horizontalPadding}
          bottomPadding={scrollBottomPadding}
          contentMaxWidth={contentMaxWidth}
          topPadding={32}
        >
          <AuthLogo
            size="lg"
            title="Welcome back"
            subtitle="Sign in to track calories, portions, and feeding for your cats"
            className="mb-10"
          />

          <Card padding="md" className="mb-5 border border-border/60">
            <Text className="mb-5 text-title font-semibold text-text">
              Sign in
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
              ref={passwordRef}
              label="Password"
              placeholder="Enter your password"
              icon={Lock}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleSignIn}
              containerClassName="mb-2"
            />

            <Pressable
              className="mb-6 self-end py-2 active:opacity-70"
              accessibilityRole="button"
              accessibilityLabel="Forgot password"
              onPress={() => router.push("/forgot-password")}
            >
              <Text className="text-caption font-semibold text-primary">
                Forgot password?
              </Text>
            </Pressable>

            <PrimaryButton
              label="Sign In"
              loadingLabel="Signing in…"
              onPress={handleSignIn}
              loading={loading}
              disabled={loading}
            />
          </Card>

          <View className="my-5 flex-row items-center">
            <View className="h-px flex-1 bg-border" />
            <Text className="mx-4 text-caption font-medium text-secondary">
              New to CatCal?
            </Text>
            <View className="h-px flex-1 bg-border" />
          </View>

          <SecondaryButton
            label="Create an account"
            onPress={() => router.push("/create-account")}
          />

          <LegalConsentText className="mt-6" />
        </AuthScreenScroll>
      </SafeAreaView>
    </AuthBackground>
  );
}
