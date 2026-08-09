import { getFoodBrand } from "../constants/foodBrands";
import {
  DEFAULT_FEEDING_SCHEDULE,
  toDisplaySchedule,
  type MealScheduleItem,
} from "./feedingSchedule";
import { buildCatQrPayload } from "./qr";
import type { CatProfile, FoodBrand, NutritionPlan } from "../types/cat";

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

/** Resting Energy Requirement (kcal/day) — veterinary formula. */
export function calculateRER(weightKg: number): number {
  if (weightKg <= 0) return 0;
  return 70 * Math.pow(weightKg, 0.75);
}

/** Maintenance Energy Requirement with activity + health adjustments. */
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

export function buildNutritionPlan(
  cat: CatProfile,
  brands?: FoodBrand[],
  feedingSchedule: MealScheduleItem[] = DEFAULT_FEEDING_SCHEDULE
): NutritionPlan {
  const rer = Math.round(calculateRER(cat.weightKg));
  const activity = ACTIVITY_FACTORS[cat.activityLevel] ?? 1.4;
  const health = HEALTH_FACTORS[cat.healthCondition] ?? 1.0;
  const dailyKcal = calculateDailyKcal(
    cat.weightKg,
    cat.activityLevel,
    cat.healthCondition
  );
  const brand = getFoodBrand(cat.foodBrandValue, brands);
  const kcalPer100g = brand?.kcalPer100g ?? 360;
  const mealCount = Math.max(feedingSchedule.length, 1);
  const gramsPerDay = Math.round((dailyKcal / kcalPer100g) * 100);
  const gramsPerMeal = Math.floor(gramsPerDay / mealCount);
  const kcalPerMeal = Math.floor(dailyKcal / mealCount);

  return {
    dailyKcal,
    kcalPerMeal,
    gramsPerDay,
    gramsPerMeal,
    schedule: toDisplaySchedule(feedingSchedule),
    foodBrandLabel: brand?.label ?? "Selected food",
    rer,
    activityFactor: activity,
    healthFactor: health,
    kcalPer100g,
  };
}

export function lbsToKg(lbs: number): number {
  return lbs / 2.20462;
}

export function generateQrCode(catId: string): string {
  return buildCatQrPayload(catId);
}

export function getCatAgeLabel(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  if (Number.isNaN(birth.getTime()) || birth > now) return "Unknown age";
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 1) return `${Math.max(months, 1)} mo`;
  if (months === 0) return `${years} yr`;
  return `${years} yr ${months} mo`;
}
