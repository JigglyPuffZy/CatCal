import { useState } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle2, Utensils } from "lucide-react-native";
import {
  GlassCard,
  HelpBanner,
  LoadingOverlay,
  NavigationBar,
  PrimaryButton,
  TimePicker,
} from "../components";
import { useCatFeeding } from "../context/CatFeedingContext";
import {
  getMealTimeInTimezone,
  mealTimeToTodayIso,
} from "../lib/feedingSchedule";
import { getRouteParam } from "../lib/routeParams";
import { useTheme } from "../theme/ThemeProvider";

export function MarkFedScreen() {
  const params = useLocalSearchParams<{ catId?: string | string[] }>();
  const catId = getRouteParam(params.catId);
  const router = useRouter();
  const { colors } = useTheme();
  const { getCat, getPlan, markAsFed, getTodayFeedingStatus } = useCatFeeding();
  const [fedTime, setFedTime] = useState(() => getMealTimeInTimezone());
  const [saving, setSaving] = useState(false);

  const cat = catId ? getCat(catId) : undefined;
  const plan = cat ? getPlan(cat.id) : null;

  if (!cat || !plan) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
        <View className="px-4">
          <NavigationBar title="Log a meal" onBack={() => router.back()} />
        </View>
        <View className="flex-1 justify-center px-4">
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600", textAlign: "center" }}>
            Cat not found
          </Text>
          <Text
            style={{
              marginTop: 8,
              color: colors.secondaryText,
              fontSize: 14,
              textAlign: "center",
              lineHeight: 21,
            }}
          >
            This meal log link is invalid or the cat was removed.
          </Text>
          <PrimaryButton label="Go back" onPress={() => router.back()} className="mt-6" />
        </View>
      </SafeAreaView>
    );
  }

  const status = getTodayFeedingStatus(cat.id);
  const nextMeal = plan.schedule[status.mealsDone] ?? plan.schedule[0];
  const allMealsDone = status.mealsDone >= status.mealsTotal;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <LoadingOverlay
        visible={saving}
        message="Logging meal…"
        hint="Updating calories and feeding history."
      />
      <View className="px-4">
        <NavigationBar title="Log a meal" onBack={() => router.back()} />
      </View>

      <View className="flex-1 px-4">
        <HelpBanner icon={Utensils} title="Quick & simple" className="mb-5">
          {allMealsDone
            ? `${cat.name} has had all planned meals today.`
            : `Just fed ${cat.name}? Set the time below, then tap save. Portions adjust automatically from your daily plan.`}
        </HelpBanner>

        <GlassCard padding="md" className="mb-5">
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: 4 }}>
            {allMealsDone ? "All done for today" : nextMeal.label}
          </Text>
          <Text style={{ color: colors.secondaryText, fontSize: 14, marginBottom: 16 }}>
            {allMealsDone
              ? "Come back tomorrow for the next meals."
              : "Recommended amount for this meal"}
          </Text>

          <View className="flex-row gap-3">
            <View
              className="flex-1 rounded-2xl p-4"
              style={{ backgroundColor: `${colors.primary}12` }}
            >
              <Text style={{ color: colors.secondaryText, fontSize: 13 }}>Food</Text>
              <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>
                {plan.gramsPerMeal}g
              </Text>
            </View>
            <View
              className="flex-1 rounded-2xl p-4"
              style={{ backgroundColor: `${colors.primary}12` }}
            >
              <Text style={{ color: colors.secondaryText, fontSize: 13 }}>Calories</Text>
              <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>
                {plan.kcalPerMeal}
              </Text>
            </View>
          </View>
        </GlassCard>

        {!allMealsDone ? (
          <TimePicker
            label="What time did you feed?"
            value={fedTime}
            onChange={setFedTime}
            className="mb-5"
          />
        ) : null}

        <PrimaryButton
          label={allMealsDone ? "All meals logged ✓" : `Yes, I fed ${cat.name}`}
          loadingLabel="Saving meal…"
          disabled={allMealsDone || saving}
          loading={saving}
          onPress={async () => {
            setSaving(true);
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
            try {
              const log = await markAsFed(cat.id, {
                fedAt: mealTimeToTodayIso(fedTime),
              });
              if (log) router.replace(`/cat/${cat.id}`);
            } finally {
              setSaving(false);
            }
          }}
        />

        <View className="mt-6 flex-row items-center justify-center">
          <CheckCircle2 size={16} color={colors.secondaryText} />
          <Text style={{ marginLeft: 8, color: colors.secondaryText, fontSize: 13 }}>
            {status.mealsDone} of {status.mealsTotal} meals logged today
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
