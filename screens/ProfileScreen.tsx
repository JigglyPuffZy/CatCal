import { useCallback, useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Moon,
  Sun,
  Monitor,
  ChevronRight,
  Bell,
  Shield,
  Clock3,
  Plus,
  Trash2,
} from "lucide-react-native";
import {
  Avatar,
  GlassCard,
  LoadingOverlay,
  PrimaryButton,
  ScreenContainer,
  TimePicker,
} from "../components";
import { APP_NAME } from "../constants";
import { useAuth } from "../context/AuthContext";
import { useCatFeeding } from "../context/CatFeedingContext";
import { MAX_MEALS_PER_DAY } from "../lib/feedingSchedule";
import { getRegisteredDisplayName } from "../lib/userDisplay";
import { useTheme, ThemeMode } from "../theme/ThemeProvider";

const themeOptions: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
  { mode: "light", label: "Light", icon: Sun },
  { mode: "dark", label: "Dark", icon: Moon },
  { mode: "system", label: "System", icon: Monitor },
];

function formatMemberSince(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ProfileScreen() {
  const router = useRouter();
  const { signOut, isAuthenticated, user, refreshUser } = useAuth();
  const { colors, mode, setMode, isDark } = useTheme();
  const {
    cats,
    remindersEnabled,
    setRemindersEnabled,
    feedingSchedule,
    setMealTime,
    addMealSlot,
    removeMealSlot,
  } = useCatFeeding();

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        void refreshUser().catch(() => {});
      }
    }, [isAuthenticated, refreshUser])
  );

  const registeredName = getRegisteredDisplayName(user?.fullName, user?.email);
  const memberSince = formatMemberSince(user?.createdAt);
  const [signingOut, setSigningOut] = useState(false);

  return (
    <ScreenContainer>
      <LoadingOverlay
        visible={signingOut}
        message="Signing out…"
        hint="Clearing your session."
      />
      {isAuthenticated && registeredName ? (
        <>
          <Text
            className="mb-1 text-heading font-bold"
            style={{ color: colors.text }}
            accessibilityRole="header"
          >
            {registeredName}
          </Text>
          <Text className="mb-6 text-body" style={{ color: colors.secondaryText }}>
            Your profile
          </Text>
        </>
      ) : (
        <Text
          className="mb-6 text-heading font-bold"
          style={{ color: colors.text }}
          accessibilityRole="header"
        >
          Profile
        </Text>
      )}

      {isAuthenticated && user ? (
        <GlassCard padding="md" className="mb-6">
          <View className="flex-row items-center">
            <Avatar name={registeredName ?? "CatCal User"} size="xl" />
            <View className="ml-4 flex-1">
              <Text
                className="text-title font-bold"
                style={{ color: colors.text }}
                accessibilityRole="header"
              >
                {registeredName ?? "Set your name on sign up"}
              </Text>
              {memberSince ? (
                <Text className="mt-1 text-caption" style={{ color: colors.secondaryText }}>
                  Member since {memberSince}
                </Text>
              ) : null}
              <Text className="mt-1 text-caption" style={{ color: colors.secondaryText }}>
                {cats.length === 0
                  ? "No cats yet"
                  : `${cats.length} cat${cats.length === 1 ? "" : "s"} registered`}
              </Text>
            </View>
          </View>
        </GlassCard>
      ) : (
        <GlassCard padding="md" className="mb-6">
          <Text className="mb-2 text-body font-semibold" style={{ color: colors.text }}>
            Sign in to see your account
          </Text>
          <Text className="mb-4 text-caption leading-5" style={{ color: colors.secondaryText }}>
            Your registered name and email appear here after you log in.
          </Text>
          <PrimaryButton label="Sign in" onPress={() => router.push("/login")} />
        </GlassCard>
      )}

      <Text className="mb-3 text-caption font-semibold uppercase tracking-wide" style={{ color: colors.secondaryText }}>
        Appearance
      </Text>
      <GlassCard padding="sm" className="mb-6">
        <View className="flex-row gap-2">
          {themeOptions.map(({ mode: optionMode, label, icon: Icon }) => {
            const selected = mode === optionMode;
            return (
              <Pressable
                key={optionMode}
                onPress={() => setMode(optionMode)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className="flex-1 items-center rounded-2xl py-3 active:opacity-80"
                style={{
                  backgroundColor: selected ? `${colors.primary}22` : "transparent",
                  borderWidth: 1,
                  borderColor: selected ? `${colors.primary}44` : colors.border,
                }}
              >
                <Icon size={20} color={selected ? colors.primary : colors.secondaryText} />
                <Text
                  className="mt-1.5 text-caption font-semibold"
                  style={{ color: selected ? colors.primary : colors.secondaryText }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text className="mt-3 text-center text-caption" style={{ color: colors.secondaryText }}>
          {isDark ? "Dark mode is on" : "Light mode is on"}
          {mode === "system" ? " (following system)" : ""}
        </Text>
      </GlassCard>

      <Text className="mb-3 text-caption font-semibold uppercase tracking-wide" style={{ color: colors.secondaryText }}>
        Feeding times
      </Text>
      <GlassCard padding="md" className="mb-6">
        <View className="mb-4 flex-row items-center">
          <View
            className="mr-3 h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${colors.primary}18` }}
          >
            <Clock3 size={18} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-body font-semibold" style={{ color: colors.text }}>
              Daily meal times
            </Text>
            <Text className="text-caption" style={{ color: colors.secondaryText }}>
              Set your usual feeding times — portions and reminders adjust automatically
            </Text>
          </View>
        </View>
        {feedingSchedule.map((meal, index) => (
          <View
            key={meal.id}
            className={index < feedingSchedule.length - 1 ? "mb-4" : ""}
          >
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-caption font-semibold" style={{ color: colors.secondaryText }}>
                {meal.label}
              </Text>
              {feedingSchedule.length > 1 ? (
                <Pressable
                  onPress={() => removeMealSlot(meal.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${meal.label}`}
                  className="rounded-lg p-1 active:opacity-70"
                >
                  <Trash2 size={16} color={colors.secondaryText} />
                </Pressable>
              ) : null}
            </View>
            <TimePicker
              value={meal.time}
              onChange={(time) => setMealTime(meal.id, time)}
            />
          </View>
        ))}
        {feedingSchedule.length < MAX_MEALS_PER_DAY ? (
          <Pressable
            onPress={addMealSlot}
            accessibilityRole="button"
            className="mt-4 flex-row items-center justify-center rounded-2xl py-3 active:opacity-80"
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderStyle: "dashed",
            }}
          >
            <Plus size={16} color={colors.primary} />
            <Text
              className="ml-2 text-body font-semibold"
              style={{ color: colors.primary }}
            >
              Add meal time
            </Text>
          </Pressable>
        ) : null}
      </GlassCard>

      <Text className="mb-3 text-caption font-semibold uppercase tracking-wide" style={{ color: colors.secondaryText }}>
        Settings
      </Text>
      <GlassCard padding="none" className="mb-6">
        <View className="flex-row items-center px-4 py-4" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <View
            className="mr-3 h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${colors.primary}18` }}
          >
            <Bell size={18} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-body font-semibold" style={{ color: colors.text }}>
              Feeding reminders
            </Text>
            <Text className="text-caption" style={{ color: colors.secondaryText }}>
              {remindersEnabled
                ? "Preference saved — push alerts coming soon"
                : "Notify before next scheduled meal"}
            </Text>
          </View>
          <Switch
            value={remindersEnabled}
            onValueChange={setRemindersEnabled}
            trackColor={{ false: colors.border, true: `${colors.primary}88` }}
            thumbColor={remindersEnabled ? colors.primary : colors.secondaryText}
          />
        </View>
        {[
          { icon: Shield, label: "Privacy", hint: "Data & permissions" },
        ].map((item, index, arr) => {
          const Icon = item.icon;
          return (
            <Pressable
              key={item.label}
              onPress={() => router.push("/privacy-policy")}
              accessibilityRole="button"
              className="flex-row items-center px-4 py-4 active:opacity-80"
              style={
                index < arr.length - 1
                  ? { borderBottomWidth: 1, borderBottomColor: colors.border }
                  : undefined
              }
            >
              <View
                className="mr-3 h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${colors.primary}18` }}
              >
                <Icon size={18} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-body font-semibold" style={{ color: colors.text }}>
                  {item.label}
                </Text>
                <Text className="text-caption" style={{ color: colors.secondaryText }}>
                  {item.hint}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.secondaryText} />
            </Pressable>
          );
        })}
      </GlassCard>

      {isAuthenticated ? (
        <PrimaryButton
          label="Sign out"
          loadingLabel="Signing out…"
          loading={signingOut}
          disabled={signingOut}
          onPress={async () => {
            setSigningOut(true);
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
            try {
              await signOut();
              router.replace("/login");
            } finally {
              setSigningOut(false);
            }
          }}
          className="mb-6"
        />
      ) : null}

      <Text className="text-center text-caption" style={{ color: colors.secondaryText }}>
        {APP_NAME}
      </Text>
    </ScreenContainer>
  );
}
