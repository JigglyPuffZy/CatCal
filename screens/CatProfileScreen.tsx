import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronRight,
  Clock3,
  Flame,
  History,
  Pencil,
  QrCode,
  Scale,
  Utensils,
} from "lucide-react-native";
import {
  Avatar,
  GlassCard,
  HelpBanner,
  NavigationBar,
  PrimaryButton,
} from "../components";
import { useCatFeeding } from "../context/CatFeedingContext";
import { getCatAgeLabel } from "../lib/nutrition";
import { getRouteParam } from "../lib/routeParams";
import { useResponsiveLayout } from "../theme";
import { useTheme } from "../theme/ThemeProvider";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: typeof Flame;
  title: string;
}) {
  const { colors } = useTheme();
  return (
    <View className="mb-3 flex-row items-center">
      <View
        className="mr-3 h-9 w-9 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${colors.primary}18` }}
      >
        <Icon size={17} color={colors.primary} />
      </View>
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>{title}</Text>
    </View>
  );
}

export function CatProfileScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = getRouteParam(params.id);
  const router = useRouter();
  const { colors } = useTheme();
  const { horizontalPadding, contentMaxWidth } = useResponsiveLayout();
  const {
    getCat,
    getPlan,
    getFeedingHistory,
    getWeightHistory,
    getTodayFeedingStatus,
    setActiveCatId,
  } = useCatFeeding();
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

  const feedingHistory = getFeedingHistory(cat.id);
  const weightHistory = getWeightHistory(cat.id);
  const todayStatus = getTodayFeedingStatus(cat.id);
  const allMealsDone = todayStatus.mealsDone >= todayStatus.mealsTotal;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <View
        style={{
          paddingHorizontal: horizontalPadding,
          maxWidth: contentMaxWidth,
          width: "100%",
          alignSelf: "center",
        }}
      >
        <NavigationBar
          title={cat.name}
          onBack={() => router.back()}
          rightIcon={Pencil}
          onRightPress={() => router.push(`/cat/${cat.id}/edit`)}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          maxWidth: contentMaxWidth,
          width: "100%",
          alignSelf: "center",
          paddingBottom: 40,
        }}
      >
        <HelpBanner icon={Utensils} className="mb-4">
          Everything about {cat.name} in one place. After feeding, tap the green
          button at the bottom to log the meal.
        </HelpBanner>

        <GlassCard padding="md" className="mb-4" contentClassName="items-center">
          {cat.photoUri ? (
            <Image
              source={{ uri: cat.photoUri }}
              className="mb-4 h-24 w-24 rounded-[24px]"
            />
          ) : (
            <View className="mb-4">
              <Avatar name={cat.name} size="lg" />
            </View>
          )}
          <Text style={{ color: colors.text, fontSize: 26, fontWeight: "700" }}>{cat.name}</Text>
          <Text style={{ marginTop: 4, color: colors.secondaryText, fontSize: 13 }}>
            {getCatAgeLabel(cat.birthDate)} · {cat.weightKg} kg · {plan.foodBrandLabel}
          </Text>
          <Text style={{ marginTop: 8, color: colors.primary, fontSize: 13, fontWeight: "600" }}>
            {todayStatus.mealsDone}/{todayStatus.mealsTotal} meals fed today
          </Text>
        </GlassCard>

        <GlassCard padding="md" className="mb-4">
          <SectionHeader icon={Flame} title="Daily calorie requirement" />
          <View className="flex-row gap-3">
            <View
              className="flex-1 rounded-2xl p-4"
              style={{ backgroundColor: `${colors.primary}14` }}
            >
              <Text style={{ color: colors.secondaryText, fontSize: 13 }}>Daily total</Text>
              <Text style={{ color: colors.text, fontSize: 26, fontWeight: "700" }}>
                {plan.dailyKcal}
              </Text>
              <Text style={{ color: colors.secondaryText, fontSize: 12 }}>kcal / day</Text>
            </View>
            <View
              className="flex-1 rounded-2xl p-4"
              style={{ backgroundColor: `${colors.primary}10` }}
            >
              <Text style={{ color: colors.secondaryText, fontSize: 13 }}>Remaining today</Text>
              <Text style={{ color: colors.text, fontSize: 26, fontWeight: "700" }}>
                {todayStatus.kcalLeft}
              </Text>
              <Text style={{ color: colors.secondaryText, fontSize: 12 }}>kcal left</Text>
            </View>
          </View>
        </GlassCard>

        <GlassCard padding="md" className="mb-4">
          <SectionHeader icon={Utensils} title="Recommended food portion" />
          <View className="flex-row gap-3">
            <View className="flex-1 rounded-2xl p-4" style={{ backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder }}>
              <Text style={{ color: colors.secondaryText, fontSize: 13 }}>Per day</Text>
              <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700" }}>
                {plan.gramsPerDay}g
              </Text>
            </View>
            <View className="flex-1 rounded-2xl p-4" style={{ backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder }}>
              <Text style={{ color: colors.secondaryText, fontSize: 13 }}>Per meal</Text>
              <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700" }}>
                {plan.gramsPerMeal}g
              </Text>
              <Text style={{ color: colors.secondaryText, fontSize: 12 }}>
                {plan.kcalPerMeal} kcal
              </Text>
            </View>
          </View>
        </GlassCard>

        <GlassCard padding="md" className="mb-4">
          <SectionHeader icon={Clock3} title="Feeding schedule" />
          {plan.schedule.map((item) => (
            <View
              key={item.id}
              className="mb-2 flex-row items-center rounded-2xl px-4 py-3"
              style={{ backgroundColor: `${colors.primary}10` }}
            >
              <Text style={{ flex: 1, color: colors.text, fontSize: 15, fontWeight: "600" }}>
                {item.label}
              </Text>
              <Text style={{ color: colors.primary, fontSize: 15, fontWeight: "700" }}>
                {item.time}
              </Text>
            </View>
          ))}
        </GlassCard>

        <GlassCard padding="md" className="mb-4">
          <SectionHeader icon={History} title="Feeding history" />
          {feedingHistory.length === 0 ? (
            <Text style={{ color: colors.secondaryText, fontSize: 14 }}>
              No feedings logged yet. Tap Mark as Fed after each meal.
            </Text>
          ) : (
            feedingHistory.slice(0, 8).map((log) => (
              <View
                key={log.id}
                className="mb-2 flex-row items-center justify-between rounded-2xl px-4 py-3"
                style={{ backgroundColor: `${colors.primary}08` }}
              >
                <View>
                  <Text style={{ color: colors.text, fontSize: 15, fontWeight: "600" }}>
                    {log.mealLabel}
                  </Text>
                  <Text style={{ color: colors.secondaryText, fontSize: 13 }}>
                    {formatDateTime(log.fedAt)}
                  </Text>
                </View>
                <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "600" }}>
                  {log.grams}g · {log.kcal} kcal
                </Text>
              </View>
            ))
          )}
        </GlassCard>

        <GlassCard padding="md" className="mb-6">
          <SectionHeader icon={Scale} title="Weight records" />
          {weightHistory.length === 0 ? (
            <Text style={{ color: colors.secondaryText, fontSize: 14 }}>
              Weight is recorded when you register or update the cat profile.
            </Text>
          ) : (
            weightHistory.slice(0, 6).map((record, index) => (
              <View
                key={record.id}
                className="mb-2 flex-row items-center justify-between rounded-2xl px-4 py-3"
                style={{ backgroundColor: `${colors.primary}08` }}
              >
                <View>
                  <Text style={{ color: colors.text, fontSize: 15, fontWeight: "600" }}>
                    {record.weightKg} kg
                  </Text>
                  <Text style={{ color: colors.secondaryText, fontSize: 13 }}>
                    {formatDate(record.recordedAt)}
                    {index === 0 ? " · current" : ""}
                  </Text>
                </View>
                <Text style={{ color: colors.secondaryText, fontSize: 12, textTransform: "capitalize" }}>
                  {record.source.replace("_", " ")}
                </Text>
              </View>
            ))
          )}
        </GlassCard>

        <PrimaryButton
          label={allMealsDone ? "All meals logged today ✓" : `I fed ${cat.name}`}
          disabled={allMealsDone}
          onPress={() => {
            setActiveCatId(cat.id);
            router.push(`/mark-fed?catId=${cat.id}`);
          }}
        />

        <Pressable
          onPress={() => router.push(`/cat/${cat.id}/qr`)}
          className="mt-4 flex-row items-center justify-center py-3 active:opacity-80"
        >
          <QrCode size={16} color={colors.primary} />
          <Text style={{ marginLeft: 8, color: colors.primary, fontSize: 15, fontWeight: "600" }}>
            View QR code
          </Text>
          <ChevronRight size={16} color={colors.primary} style={{ marginLeft: 2 }} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
