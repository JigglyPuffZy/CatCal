import { MEALS_PER_DAY } from "../constants/foodBrands.js";
import type { FeedingSchedule } from "@prisma/client";
import {
  DEFAULT_FEEDING_SCHEDULE,
  formatMealTime,
} from "./feedingSchedule.js";
import { resolveFoodBrand } from "./foodBrands.js";
import { prisma } from "./prisma.js";

const ACTIVITY_FACTORS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.4,
  moderate: 1.6,
  active: 1.8,
};

const HEALTH_FACTORS: Record<string, number> = {
  healthy: 1.0,
  overweight: 0.85,
  underweight: 1.15,
  senior: 1.1,
  kitten: 2.0,
};

export type CatNutritionInput = {
  weightKg: number;
  activityLevel: string;
  healthCondition: string;
  foodBrandValue: string;
};

export function calculateRER(weightKg: number): number {
  if (weightKg <= 0) return 0;
  return 70 * Math.pow(weightKg, 0.75);
}

export function calculateDailyKcal(
  weightKg: number,
  activityLevel: string,
  healthCondition: string
): number {
  const rer = calculateRER(weightKg);
  const activity = ACTIVITY_FACTORS[activityLevel] ?? 1.4;
  const health = HEALTH_FACTORS[healthCondition] ?? 1.0;
  return Math.round(rer * activity * health);
}

export function scheduleToDisplay(
  rows: Pick<FeedingSchedule, "id" | "label" | "time">[]
) {
  const source =
    rows.length > 0
      ? rows
      : DEFAULT_FEEDING_SCHEDULE.map((item, index) => ({
          id: item.id,
          label: item.label,
          time: item.time,
          sortOrder: index,
        }));

  return source.map((item) => ({
    id: item.id,
    label: item.label,
    time: formatMealTime(item.time),
  }));
}

export async function computeNutritionValues(
  cat: CatNutritionInput,
  mealCount = MEALS_PER_DAY
) {
  const rer = Math.round(calculateRER(cat.weightKg));
  const activityFactor = ACTIVITY_FACTORS[cat.activityLevel] ?? 1.4;
  const healthFactor = HEALTH_FACTORS[cat.healthCondition] ?? 1.0;
  const dailyKcal = calculateDailyKcal(
    cat.weightKg,
    cat.activityLevel,
    cat.healthCondition
  );
  const brand = await resolveFoodBrand(cat.foodBrandValue);
  const kcalPer100g = brand?.kcalPer100g ?? 360;
  const mealsTotal = Math.max(mealCount, 1);
  const gramsPerDay = Math.round((dailyKcal / kcalPer100g) * 100);
  const gramsPerMeal = Math.floor(gramsPerDay / mealsTotal);
  const kcalPerMeal = Math.floor(dailyKcal / mealsTotal);

  return {
    dailyKcal,
    kcalPerMeal,
    gramsPerDay,
    gramsPerMeal,
    foodBrandLabel: brand?.label ?? "Selected food",
    rer,
    activityFactor,
    healthFactor,
    kcalPer100g,
    mealsTotal,
  };
}

export async function saveNutritionPlan(
  catId: string,
  cat: CatNutritionInput,
  mealCount: number
) {
  const values = await computeNutritionValues(cat, mealCount);

  await prisma.catNutritionPlan.updateMany({
    where: { catId, isCurrent: true },
    data: { isCurrent: false },
  });

  return prisma.catNutritionPlan.create({
    data: {
      catId,
      dailyKcal: values.dailyKcal,
      kcalPerMeal: values.kcalPerMeal,
      gramsPerDay: values.gramsPerDay,
      gramsPerMeal: values.gramsPerMeal,
      foodBrandLabel: values.foodBrandLabel,
      rer: values.rer,
      activityFactor: values.activityFactor,
      healthFactor: values.healthFactor,
      kcalPer100g: values.kcalPer100g,
      isCurrent: true,
    },
  });
}

export async function getCurrentNutritionPlan(catId: string) {
  return prisma.catNutritionPlan.findFirst({
    where: { catId, isCurrent: true },
    orderBy: { computedAt: "desc" },
  });
}

export async function getTodayFeedingStatus(
  cat: CatNutritionInput,
  todayLogs: { kcal: number; fedAt: Date }[],
  scheduleRows: Pick<FeedingSchedule, "id" | "label" | "time" | "sortOrder">[],
  plan?: Awaited<ReturnType<typeof getCurrentNutritionPlan>>
) {
  const mealsTotal = Math.max(scheduleRows.length, 1);
  const computed = await computeNutritionValues(cat, mealsTotal);
  const mealsDone = todayLogs.length;
  const kcalFed = todayLogs.reduce((sum, log) => sum + log.kcal, 0);
  const kcalLeft = Math.max(
    (plan?.dailyKcal ?? computed.dailyKcal) - kcalFed,
    0
  );
  const displaySchedule = scheduleToDisplay(scheduleRows);
  const nextSchedule =
    displaySchedule[mealsDone] ?? displaySchedule[displaySchedule.length - 1];

  return {
    mealsDone: Math.min(mealsDone, mealsTotal),
    mealsTotal,
    kcalLeft,
    nextMealLabel: nextSchedule?.label ?? "Next meal",
    nextMealTime: nextSchedule?.time ?? "—",
    plan: plan ?? null,
    computed,
    schedule: displaySchedule,
  };
}

export function buildCatQrPayload(catId: string): string {
  return `catcal://cat/${catId}`;
}

export function parseCatQrPayload(data: string): string | null {
  const trimmed = data.trim();
  if (!trimmed) return null;
  const deepLink = trimmed.match(/^catcal:\/\/cat\/([^/?#\s]+)/i);
  if (deepLink?.[1]) return decodeURIComponent(deepLink[1]);
  return null;
}
