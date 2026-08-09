import type {
  Cat,
  CatNutritionPlan,
  FeedingLog,
  FeedingSchedule,
  NotificationSettings,
  Profile,
  User,
  WeightLog,
} from "@prisma/client";
import { resolveRegisteredName } from "./displayName.js";

export function serializeProfile(user: User, profile: Profile | null) {
  return {
    id: user.id,
    email: user.email,
    fullName: resolveRegisteredName(profile?.fullName, user.email),
    activeCatId: profile?.activeCatId ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: profile?.updatedAt.toISOString() ?? user.updatedAt.toISOString(),
  };
}

export function serializeNotificationSettings(settings: NotificationSettings) {
  return {
    remindersEnabled: settings.remindersEnabled,
    notifyBeforeMinutes: settings.notifyBeforeMinutes,
    pushEnabled: settings.pushEnabled,
  };
}

export function serializeFeedingSchedule(row: FeedingSchedule) {
  return {
    id: row.id,
    label: row.label,
    time: row.time,
    sortOrder: row.sortOrder,
  };
}

export function serializeCat(cat: Cat) {
  return {
    id: cat.id,
    name: cat.name,
    photoUri: cat.photoUri ?? undefined,
    birthDate: cat.birthDate.toISOString(),
    weightKg: cat.weightKg,
    sex: cat.sex,
    activityLevel: cat.activityLevel,
    healthCondition: cat.healthCondition,
    foodBrandValue: cat.foodBrandValue,
    qrCode: cat.qrCode,
    createdAt: cat.createdAt.toISOString(),
  };
}

export function serializeNutritionPlan(
  plan: CatNutritionPlan,
  schedule: ReturnType<typeof serializeFeedingSchedule>[]
) {
  return {
    id: plan.id,
    catId: plan.catId,
    dailyKcal: plan.dailyKcal,
    kcalPerMeal: plan.kcalPerMeal,
    gramsPerDay: plan.gramsPerDay,
    gramsPerMeal: plan.gramsPerMeal,
    foodBrandLabel: plan.foodBrandLabel,
    rer: plan.rer,
    activityFactor: plan.activityFactor,
    healthFactor: plan.healthFactor,
    kcalPer100g: plan.kcalPer100g,
    schedule: schedule.map((item) => ({
      id: item.id,
      label: item.label,
      time: formatDisplayTime(item.time),
    })),
    computedAt: plan.computedAt.toISOString(),
  };
}

export function serializeFeedingLog(log: FeedingLog) {
  return {
    id: log.id,
    catId: log.catId,
    mealLabel: log.mealLabel,
    grams: log.grams,
    kcal: log.kcal,
    fedAt: log.fedAt.toISOString(),
  };
}

export function serializeWeightLog(record: WeightLog) {
  return {
    id: record.id,
    catId: record.catId,
    weightKg: record.weightKg,
    recordedAt: record.recordedAt.toISOString(),
    source: record.source as "registration" | "profile_update" | "manual",
  };
}

function formatDisplayTime(time24: string): string {
  const [hours, minutes] = time24.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}
