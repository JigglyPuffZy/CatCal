import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

type LegalConsentTextProps = {
  prefix?: string;
  className?: string;
};

export function LegalConsentText({
  prefix = "By continuing, you agree to our",
  className = "",
}: LegalConsentTextProps) {
  const router = useRouter();

  return (
    <View className={`items-center ${className}`}>
      <View className="flex-row flex-wrap items-center justify-center px-2">
        <Text
          selectable={false}
          className="text-center text-caption leading-5 text-secondary"
        >
          {prefix}{" "}
        </Text>
        <Pressable
          onPress={() => router.push("/terms")}
          onLongPress={() => router.push("/terms")}
          delayLongPress={200}
          hitSlop={6}
          accessibilityRole="link"
          accessibilityLabel="Terms of Service"
          className="active:opacity-70"
        >
          <Text selectable={false} className="text-caption font-semibold text-primary">
            Terms of Service
          </Text>
        </Pressable>
        <Text
          selectable={false}
          className="text-caption leading-5 text-secondary"
        >
          {" "}
          and{" "}
        </Text>
        <Pressable
          onPress={() => router.push("/privacy-policy")}
          onLongPress={() => router.push("/privacy-policy")}
          delayLongPress={200}
          hitSlop={6}
          accessibilityRole="link"
          accessibilityLabel="Privacy Policy"
          className="active:opacity-70"
        >
          <Text selectable={false} className="text-caption font-semibold text-primary">
            Privacy Policy
          </Text>
        </Pressable>
        <Text selectable={false} className="text-caption leading-5 text-secondary">
          .
        </Text>
      </View>
    </View>
  );
}
