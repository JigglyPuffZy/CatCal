import type { MealScheduleDisplayItem } from "../lib/feedingSchedule";

export type FoodBrand = {
  value: string;
  label: string;
  kcalPer100g: number;
};

export type CatProfile = {
  id: string;
  name: string;
  photoUri?: string;
  birthDate: string;
  weightKg: number;
  sex: string;
  activityLevel: string;
  healthCondition: string;
  foodBrandValue: string;
  qrCode: string;
  createdAt: string;
};

export type NutritionPlan = {
  id?: string;
  catId?: string;
  dailyKcal: number;
  kcalPerMeal: number;
  gramsPerDay: number;
  gramsPerMeal: number;
  schedule: MealScheduleDisplayItem[];
  foodBrandLabel: string;
  computedAt?: string;
  rer?: number;
  activityFactor?: number;
  healthFactor?: number;
  kcalPer100g?: number;
};

export type FeedingLog = {
  id: string;
  catId: string;
  mealLabel: string;
  grams: number;
  kcal: number;
  fedAt: string;
};

export type WeightRecord = {
  id: string;
  catId: string;
  weightKg: number;
  recordedAt: string;
  source: "registration" | "profile_update" | "manual";
};

export type CatFormData = {
  name: string;
  photoUri?: string;
  birthDate: Date;
  weightKg: string;
  weightUnit: "kg" | "lbs";
  sex: string;
  activityLevel: string;
  healthCondition: string;
  foodBrandValue: string;
};
