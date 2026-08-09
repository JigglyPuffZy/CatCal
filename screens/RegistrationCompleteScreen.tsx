import { Image, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CheckCircle2,
  Cat,
  Flame,
  Home,
  QrCode,
  Sparkles,
} from "lucide-react-native";
import { FlowSteps, GlassCard, PrimaryButton, SecondaryButton } from "../components";
import { REGISTRATION_STEPS } from "../constants/registrationFlow";
import { useCatFeeding } from "../context/CatFeedingContext";
import { getRouteParam } from "../lib/routeParams";
import { useResponsiveLayout } from "../theme";
import { useTheme } from "../theme/ThemeProvider";

const SETUP_ITEMS = [
  { icon: Cat, label: "Cat profile saved", key: "profile" },
  { icon: QrCode, label: "QR code generated", key: "qr" },
  { icon: Flame, label: "Calorie plan calculated", key: "plan" },
] as const;

export function RegistrationCompleteScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = getRouteParam(params.id);
  const router = useRouter();
  const { colors } = useTheme();
  const { horizontalPadding, contentMaxWidth } = useResponsiveLayout();
  const { getCat, getPlan, setActiveCatId } = useCatFeeding();
  const cat = id ? getCat(id) : undefined;

  if (!cat) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Text style={{ padding: 16, color: colors.text }}>Cat not found.</Text>
      </SafeAreaView>
    );
  }

  const plan = getPlan(cat.id);
  if (!plan) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Text style={{ padding: 16, color: colors.text }}>Could not load meal plan.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -40,
          right: -50,
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: colors.orbPrimary,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: 120,
          left: -70,
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: colors.orbAccent,
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          maxWidth: contentMaxWidth,
          width: "100%",
          alignSelf: "center",
          paddingTop: 12,
          paddingBottom: 40,
        }}
      >
        <FlowSteps steps={REGISTRATION_STEPS} currentStep={4} />

        <GlassCard padding="lg" className="mb-5" contentClassName="items-center">
          <View
            className="mb-4 h-24 w-24 items-center justify-center overflow-hidden rounded-full border-[3px]"
            style={{ borderColor: colors.primary, backgroundColor: `${colors.primary}14` }}
          >
            {cat.photoUri ? (
              <Image source={{ uri: cat.photoUri }} className="h-full w-full" />
            ) : (
              <Cat size={40} color={colors.primary} strokeWidth={1.8} />
            )}
          </View>

          <View
            className="mb-3 flex-row items-center rounded-full px-3 py-1.5"
            style={{ backgroundColor: `${colors.primary}18` }}
          >
            <CheckCircle2 size={16} color={colors.primary} />
            <Text
              style={{
                marginLeft: 6,
                color: colors.primary,
                fontSize: 13,
                fontWeight: "700",
              }}
            >
              Setup complete
            </Text>
          </View>

          <Text
            style={{
              textAlign: "center",
              color: colors.text,
              fontSize: 26,
              fontWeight: "700",
            }}
          >
            {cat.name} is ready!
          </Text>
          <Text
            style={{
              marginTop: 8,
              textAlign: "center",
              color: colors.secondaryText,
              fontSize: 15,
              lineHeight: 22,
              maxWidth: 300,
            }}
          >
            Profile, QR code, and feeding plan are all set. Head to your dashboard
            to start tracking meals.
          </Text>
        </GlassCard>

        <GlassCard padding="md" className="mb-5">
          <View className="mb-4 flex-row items-center">
            <View
              className="mr-3 h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${colors.primary}18` }}
            >
              <Sparkles size={18} color={colors.primary} />
            </View>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
              What we set up
            </Text>
          </View>

          {SETUP_ITEMS.map((item) => (
            <View
              key={item.key}
              className="mb-2 flex-row items-center rounded-2xl px-4 py-3"
              style={{ backgroundColor: `${colors.primary}10` }}
            >
              <View
                className="mr-3 h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: `${colors.primary}22` }}
              >
                <item.icon size={16} color={colors.primary} />
              </View>
              <Text style={{ flex: 1, color: colors.text, fontSize: 15, fontWeight: "600" }}>
                {item.label}
              </Text>
              <CheckCircle2 size={18} color={colors.primary} />
            </View>
          ))}
        </GlassCard>

        <GlassCard padding="md" className="mb-6">
          <Text style={{ color: colors.secondaryText, fontSize: 13, marginBottom: 4 }}>
            Today&apos;s target
          </Text>
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>
            {plan.dailyKcal} kcal
          </Text>
          <Text style={{ marginTop: 4, color: colors.secondaryText, fontSize: 13 }}>
            {plan.gramsPerDay}g total · {plan.schedule.length} meals
          </Text>
        </GlassCard>

        <PrimaryButton
          label="Go to Dashboard"
          onPress={() => {
            setActiveCatId(cat.id);
            router.replace("/(tabs)");
          }}
        />
        <SecondaryButton
          label="View cat profile"
          onPress={() => router.push(`/cat/${cat.id}`)}
          className="mt-3"
        />
        <View className="mt-4 flex-row items-center justify-center">
          <Home size={14} color={colors.secondaryText} />
          <Text style={{ marginLeft: 6, color: colors.secondaryText, fontSize: 13 }}>
            Step 4 of 4 — you&apos;re all set
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
