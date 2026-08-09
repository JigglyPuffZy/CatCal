import { Alert, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Bell,
  Moon,
  Sun,
  Utensils,
  Clock3,
  Flame,
  Scale,
  ScanLine,
  Cat,
  ChevronRight,
  CheckCircle2,
  Plus,
  QrCode,
} from "lucide-react-native";
import {
  Avatar,
  GlassCard,
  HelpBanner,
  HowItWorksCard,
  PageIntro,
  PressableScale,
  PrimaryButton,
  ScreenContainer,
} from "../components";
import { useCatFeeding } from "../context/CatFeedingContext";
import { useAuth } from "../context/AuthContext";
import { getRegisteredDisplayName } from "../lib/userDisplay";
import { formatTodayDate, getGreeting, useResponsiveLayout } from "../theme";
import { useTheme } from "../theme/ThemeProvider";

const GETTING_STARTED = [
  {
    icon: Cat,
    title: "Add your cat",
    description: "Enter name, weight, and food. We create a QR code and meal plan.",
  },
  {
    icon: QrCode,
    title: "Scan or pick a cat",
    description: "Use the Scan tab for collar tags, or pick a cat from the Cats tab.",
  },
  {
    icon: Utensils,
    title: "Log each meal",
    description: "After feeding, tap “I fed my cat” — we update calories and history.",
  },
] as const;

export function DashboardScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { isCompact, sectionGap, quickActionWidth, gridGap } =
    useResponsiveLayout();
  const registeredName = getRegisteredDisplayName(user?.fullName, user?.email);
  const greeting = getGreeting(registeredName ?? undefined);
  const {
    activeCat,
    activePlan,
    feedingLogs,
    getTodayFeedingStatus,
    remindersEnabled,
  } = useCatFeeding();

  if (!activeCat || !activePlan) {
    return (
      <ScreenContainer>
        <PageIntro
          title={`${greeting} 👋`}
          subtitle="Welcome to CatCal. Add your first cat to get a feeding plan and start tracking meals."
        />
        <GlassCard padding="lg" className="mb-5" contentClassName="items-center">
          <PrimaryButton
            label="Add my first cat"
            onPress={() => router.push("/cat/add")}
          />
        </GlassCard>
        <HowItWorksCard steps={[...GETTING_STARTED]} />
      </ScreenContainer>
    );
  }

  const status = getTodayFeedingStatus(activeCat.id);
  const progress =
    status.mealsTotal > 0 ? status.mealsDone / status.mealsTotal : 0;
  const allMealsDone = status.mealsDone >= status.mealsTotal;

  const recentLogs = feedingLogs
    .filter((log) => log.catId === activeCat.id)
    .slice(0, 3);

  const quickActions = [
    {
      key: "feed",
      label: "Log a meal",
      icon: Utensils,
      hint: "I fed my cat",
      onPress: () => router.push(`/mark-fed?catId=${activeCat.id}`),
    },
    {
      key: "scan",
      label: "Scan QR",
      icon: ScanLine,
      hint: "Open a profile",
      onPress: () => router.push("/(tabs)/scan"),
    },
    {
      key: "cats",
      label: "Switch cat",
      icon: Cat,
      hint: "Pick another",
      onPress: () => router.push("/(tabs)/cats"),
    },
    {
      key: "profile",
      label: "Full profile",
      icon: Scale,
      hint: "History & plan",
      onPress: () => router.push(`/cat/${activeCat.id}`),
    },
  ] as const;

  return (
    <ScreenContainer>
      <View className="mb-5 flex-row items-start justify-between">
        <View className="min-w-0 flex-1 pr-3">
          <Text
            style={{ color: colors.text, fontSize: 28, fontWeight: "700" }}
            accessibilityRole="header"
          >
            {greeting} 👋
          </Text>
          <Text style={{ marginTop: 4, color: colors.secondaryText, fontSize: 15 }}>
            {formatTodayDate()}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={toggleTheme}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={isDark ? "Light mode" : "Dark mode"}
            className="h-11 w-11 items-center justify-center rounded-2xl active:opacity-80"
            style={{
              backgroundColor: colors.glass,
              borderWidth: 1,
              borderColor: colors.glassBorder,
            }}
          >
            {isDark ? (
              <Sun size={20} color={colors.primary} />
            ) : (
              <Moon size={20} color={colors.text} />
            )}
          </Pressable>
          <Pressable
            onPress={() =>
              Alert.alert(
                "Reminders",
                remindersEnabled
                  ? "Meal reminders are saved. Push notifications will be added in a future update."
                  : "Turn on feeding reminders in Profile when notifications launch."
              )
            }
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            className="h-11 w-11 items-center justify-center rounded-2xl active:opacity-80"
            style={{
              backgroundColor: colors.glass,
              borderWidth: 1,
              borderColor: colors.glassBorder,
            }}
          >
            <Bell size={20} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <HelpBanner icon={Cat} title={`Today: ${activeCat.name}`} className="mb-5">
        {allMealsDone
          ? "All meals are logged for today. Great job!"
          : `Next up: ${status.nextMealLabel} at ${status.nextMealTime} — give ${activePlan.gramsPerMeal}g of food.`}
      </HelpBanner>

      <GlassCard padding="md" style={{ marginBottom: sectionGap }}>
        <Pressable
          onPress={() => router.push(`/cat/${activeCat.id}`)}
          className="mb-5 flex-row items-center active:opacity-90"
        >
          <Avatar
            name={activeCat.name}
            uri={activeCat.photoUri}
            size={isCompact ? "md" : "lg"}
          />
          <View className="ml-4 min-w-0 flex-1">
            <Text
              style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}
              numberOfLines={1}
            >
              {activeCat.name}
            </Text>
            <Text style={{ marginTop: 2, color: colors.secondaryText, fontSize: 13 }}>
              {activeCat.weightKg} kg · {activePlan.foodBrandLabel}
            </Text>
          </View>
          <ChevronRight size={20} color={colors.secondaryText} />
        </Pressable>

        <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600", marginBottom: 4 }}>
          Today&apos;s progress
        </Text>
        <Text style={{ color: colors.secondaryText, fontSize: 13, marginBottom: 12 }}>
          {status.mealsDone} of {status.mealsTotal} meals logged
        </Text>

        <View
          className="mb-5 h-3 overflow-hidden rounded-full"
          style={{ backgroundColor: colors.border }}
        >
          <View
            className="h-full rounded-full"
            style={{
              width: `${Math.min(progress * 100, 100)}%`,
              backgroundColor: colors.primary,
            }}
          />
        </View>

        <View className={isCompact ? "gap-3" : "flex-row gap-3"}>
          <View
            className="min-w-0 flex-1 rounded-2xl p-4"
            style={{ backgroundColor: `${colors.primary}14` }}
          >
            <View className="mb-2 flex-row items-center">
              <Flame size={16} color={colors.primary} />
              <Text style={{ marginLeft: 8, color: colors.secondaryText, fontSize: 13 }}>
                Still needs today
              </Text>
            </View>
            <Text style={{ color: colors.text, fontSize: 26, fontWeight: "700" }}>
              {status.kcalLeft}
              <Text style={{ color: colors.secondaryText, fontSize: 16, fontWeight: "500" }}>
                {" "}
                kcal
              </Text>
            </Text>
          </View>

          <View
            className="min-w-0 flex-1 rounded-2xl p-4"
            style={{
              backgroundColor: colors.glass,
              borderWidth: 1,
              borderColor: colors.glassBorder,
            }}
          >
            <View className="mb-2 flex-row items-center">
              <Clock3 size={16} color={colors.primary} />
              <Text style={{ marginLeft: 8, color: colors.secondaryText, fontSize: 13 }}>
                Next meal
              </Text>
            </View>
            <Text style={{ color: colors.text, fontSize: 26, fontWeight: "700" }}>
              {status.nextMealTime}
            </Text>
            <Text style={{ marginTop: 2, color: colors.secondaryText, fontSize: 13 }}>
              {activePlan.gramsPerMeal}g · {status.nextMealLabel}
            </Text>
          </View>
        </View>

        <PrimaryButton
          label={allMealsDone ? "All meals logged ✓" : `I fed ${activeCat.name}`}
          disabled={allMealsDone}
          onPress={() => router.push(`/mark-fed?catId=${activeCat.id}`)}
          className="mt-5"
        />
        {!allMealsDone ? (
          <Text
            style={{
              marginTop: 10,
              textAlign: "center",
              color: colors.secondaryText,
              fontSize: 12,
            }}
          >
            Tap after each meal to keep history up to date
          </Text>
        ) : null}
      </GlassCard>

      <Text style={{ marginBottom: 12, color: colors.text, fontSize: 18, fontWeight: "600" }}>
        Shortcuts
      </Text>
      <View className="mb-6 flex-row flex-wrap" style={{ gap: gridGap }}>
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <PressableScale
              key={action.key}
              style={{ width: quickActionWidth }}
              onPress={action.onPress}
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <GlassCard padding="sm" intensity={45}>
                <View
                  className="h-11 w-11 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${colors.primary}20` }}
                >
                  <Icon size={22} color={colors.primary} strokeWidth={2.2} />
                </View>
                <Text
                  style={{
                    marginTop: 12,
                    color: colors.text,
                    fontSize: 15,
                    fontWeight: "600",
                  }}
                  numberOfLines={1}
                >
                  {action.label}
                </Text>
                <Text
                  style={{ marginTop: 2, color: colors.secondaryText, fontSize: 12 }}
                  numberOfLines={1}
                >
                  {action.hint}
                </Text>
              </GlassCard>
            </PressableScale>
          );
        })}
      </View>

      <View className="mb-2 flex-row items-center justify-between">
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600" }}>
          Recent meals
        </Text>
        <Pressable
          onPress={() => router.push(`/cat/${activeCat.id}`)}
          hitSlop={8}
          className="flex-row items-center"
        >
          <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}>
            See all
          </Text>
          <ChevronRight size={16} color={colors.primary} />
        </Pressable>
      </View>

      <GlassCard padding="none" className="mb-4">
        {recentLogs.length === 0 ? (
          <View className="px-4 py-6">
            <Text style={{ textAlign: "center", color: colors.secondaryText, fontSize: 14 }}>
              No meals logged yet.
            </Text>
            <Text
              style={{
                marginTop: 4,
                textAlign: "center",
                color: colors.secondaryText,
                fontSize: 13,
              }}
            >
              Feed your cat, then tap “I fed {activeCat.name}” above.
            </Text>
          </View>
        ) : (
          recentLogs.map((item, index) => (
            <View
              key={item.id}
              className="flex-row items-center px-4 py-4"
              style={
                index < recentLogs.length - 1
                  ? { borderBottomWidth: 1, borderBottomColor: colors.border }
                  : undefined
              }
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${colors.primary}18` }}
              >
                <CheckCircle2 size={18} color={colors.primary} />
              </View>
              <View className="ml-3 min-w-0 flex-1">
                <Text
                  style={{ color: colors.text, fontSize: 15, fontWeight: "600" }}
                  numberOfLines={1}
                >
                  {item.mealLabel}
                </Text>
                <Text
                  style={{ marginTop: 2, color: colors.secondaryText, fontSize: 13 }}
                  numberOfLines={1}
                >
                  {item.grams}g · {item.kcal} kcal ·{" "}
                  {new Date(item.fedAt).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>
          ))
        )}
      </GlassCard>

      <Pressable
        onPress={() => router.push("/cat/add")}
        className="mt-2 flex-row items-center justify-center py-3 active:opacity-80"
      >
        <Plus size={18} color={colors.primary} />
        <Text style={{ marginLeft: 8, color: colors.primary, fontSize: 15, fontWeight: "600" }}>
          Add another cat
        </Text>
      </Pressable>
    </ScreenContainer>
  );
}
