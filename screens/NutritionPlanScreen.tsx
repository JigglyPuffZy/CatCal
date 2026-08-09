import { Image, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CalendarClock,
  Cat,
  Clock3,
  Flame,
  Sparkles,
  Utensils,
} from "lucide-react-native";
import {
  FlowSteps,
  GlassCard,
  NavigationBar,
  PrimaryButton,
  SecondaryButton,
} from "../components";
import { REGISTRATION_STEPS } from "../constants/registrationFlow";
import { useCatFeeding } from "../context/CatFeedingContext";
import { calculateRER, getCatAgeLabel } from "../lib/nutrition";
import { getRouteParam } from "../lib/routeParams";
import { useResponsiveLayout } from "../theme";
import { useTheme } from "../theme/ThemeProvider";

export function NutritionPlanScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = getRouteParam(params.id);
  const router = useRouter();
  const { colors } = useTheme();
  const { horizontalPadding, contentMaxWidth } = useResponsiveLayout();
  const { getCat, getPlan } = useCatFeeding();
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

  const rer = Math.round(calculateRER(cat.weightKg));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -50,
          left: -60,
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: colors.orbPrimary,
        }}
      />

      <View
        style={{
          paddingHorizontal: horizontalPadding,
          maxWidth: contentMaxWidth,
          width: "100%",
          alignSelf: "center",
        }}
      >
        <NavigationBar title="Calorie Plan" onBack={() => router.back()} />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          maxWidth: contentMaxWidth,
          width: "100%",
          alignSelf: "center",
          paddingBottom: 40,
        }}
      >
        <FlowSteps steps={REGISTRATION_STEPS} currentStep={3} />

        <GlassCard padding="md" className="mb-5">
          <View className="flex-row items-center">
            <View
              className="mr-4 h-14 w-14 items-center justify-center overflow-hidden rounded-2xl"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              {cat.photoUri ? (
                <Image source={{ uri: cat.photoUri }} className="h-full w-full" />
              ) : (
                <Cat size={28} color={colors.primary} strokeWidth={2} />
              )}
            </View>
            <View className="min-w-0 flex-1">
              <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>
                {cat.name}&apos;s plan
              </Text>
              <Text style={{ marginTop: 2, color: colors.secondaryText, fontSize: 13 }}>
                {getCatAgeLabel(cat.birthDate)} · {cat.weightKg} kg · {plan.foodBrandLabel}
              </Text>
            </View>
            <View
              className="rounded-full px-3 py-1.5"
              style={{ backgroundColor: `${colors.primary}18` }}
            >
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "700" }}>
                STEP 3
              </Text>
            </View>
          </View>
        </GlassCard>

        <Text style={{ marginBottom: 8, color: colors.text, fontSize: 18, fontWeight: "700" }}>
          Daily feeding recommendation
        </Text>
        <Text
          style={{
            marginBottom: 20,
            color: colors.secondaryText,
            fontSize: 15,
            lineHeight: 22,
          }}
        >
          Calculated from weight, activity, health, and food energy density. You
          feed manually — tap Mark as Fed after each meal.
        </Text>

        <GlassCard padding="md" className="mb-4">
          <View className="mb-4 flex-row items-center">
            <View
              className="mr-3 h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${colors.primary}18` }}
            >
              <Sparkles size={18} color={colors.primary} />
            </View>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
              Calorie breakdown
            </Text>
          </View>

          <View className="mb-4 flex-row gap-3">
            <View
              className="flex-1 rounded-2xl p-4"
              style={{ backgroundColor: `${colors.primary}14` }}
            >
              <Flame size={18} color={colors.primary} />
              <Text style={{ marginTop: 8, color: colors.secondaryText, fontSize: 13 }}>
                Daily total
              </Text>
              <Text style={{ color: colors.text, fontSize: 28, fontWeight: "700" }}>
                {plan.dailyKcal}
              </Text>
              <Text style={{ color: colors.secondaryText, fontSize: 12 }}>kcal / day</Text>
              <Text style={{ marginTop: 6, color: colors.secondaryText, fontSize: 12 }}>
                RER ≈ {rer} kcal
              </Text>
            </View>
            <View
              className="flex-1 rounded-2xl p-4"
              style={{
                backgroundColor: colors.glass,
                borderWidth: 1,
                borderColor: colors.glassBorder,
              }}
            >
              <Utensils size={18} color={colors.primary} />
              <Text style={{ marginTop: 8, color: colors.secondaryText, fontSize: 13 }}>
                Per meal
              </Text>
              <Text style={{ color: colors.text, fontSize: 28, fontWeight: "700" }}>
                {plan.kcalPerMeal}
              </Text>
              <Text style={{ color: colors.secondaryText, fontSize: 12 }}>kcal / meal</Text>
              <Text style={{ marginTop: 6, color: colors.secondaryText, fontSize: 12 }}>
                {plan.schedule.length} meals / day
              </Text>
            </View>
          </View>

          <Text
            style={{
              marginBottom: 12,
              color: colors.secondaryText,
              fontSize: 12,
              fontWeight: "600",
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            Food portions
          </Text>
          <View className="flex-row gap-3">
            <View
              className="flex-1 rounded-2xl p-4"
              style={{ backgroundColor: `${colors.primary}10` }}
            >
              <Text style={{ color: colors.secondaryText, fontSize: 13 }}>Per day</Text>
              <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700" }}>
                {plan.gramsPerDay}g
              </Text>
            </View>
            <View
              className="flex-1 rounded-2xl p-4"
              style={{ backgroundColor: `${colors.primary}10` }}
            >
              <Text style={{ color: colors.secondaryText, fontSize: 13 }}>Per meal</Text>
              <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700" }}>
                {plan.gramsPerMeal}g
              </Text>
            </View>
          </View>
        </GlassCard>

        <GlassCard padding="md" className="mb-6">
          <View className="mb-4 flex-row items-center">
            <View
              className="mr-3 h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${colors.primary}18` }}
            >
              <CalendarClock size={18} color={colors.primary} />
            </View>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
              Feeding schedule
            </Text>
          </View>

          {plan.schedule.map((item) => (
            <View
              key={item.id}
              className="mb-2 flex-row items-center rounded-2xl px-4 py-3.5"
              style={{ backgroundColor: `${colors.primary}10` }}
            >
              <View
                className="mr-3 h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: `${colors.primary}22` }}
              >
                <Clock3 size={16} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: "600" }}>
                  {item.label}
                </Text>
                <Text style={{ color: colors.secondaryText, fontSize: 13 }}>
                  {plan.gramsPerMeal}g · {plan.kcalPerMeal} kcal
                </Text>
              </View>
              <Text style={{ color: colors.primary, fontSize: 15, fontWeight: "700" }}>
                {item.time}
              </Text>
            </View>
          ))}

          <Text
            style={{
              marginTop: 12,
              color: colors.secondaryText,
              fontSize: 13,
              lineHeight: 20,
            }}
          >
            Reminders can be turned on in Profile after you finish setup.
          </Text>
        </GlassCard>

        <PrimaryButton
          label="Save plan & continue"
          onPress={() => router.replace(`/cat/${cat.id}/complete`)}
        />
        <SecondaryButton
          label="Edit cat info"
          onPress={() => router.push(`/cat/${cat.id}/edit`)}
          className="mt-3"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
