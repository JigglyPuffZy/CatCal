import type { FoodBrand } from "../types/cat";

export const FOOD_BRANDS: FoodBrand[] = [
  { label: "Royal Canin Indoor", value: "royal-canin-indoor", kcalPer100g: 353 },
  { label: "Purina Pro Plan Adult", value: "purina-pro-plan", kcalPer100g: 436 },
  { label: "Hill's Science Diet", value: "hills-science", kcalPer100g: 352 },
  { label: "Whiskas Dry Adult", value: "whiskas-dry", kcalPer100g: 340 },
  { label: "Blue Buffalo Indoor", value: "blue-buffalo", kcalPer100g: 372 },
];

export const MEALS_PER_DAY = 2;

import { toDisplaySchedule, DEFAULT_FEEDING_SCHEDULE } from "../lib/feedingSchedule";

/** Default meal times for display in plans and dashboards. */
export const DEFAULT_SCHEDULE = toDisplaySchedule(DEFAULT_FEEDING_SCHEDULE);

export function getFoodBrand(value: string, brands: FoodBrand[] = FOOD_BRANDS) {
  return brands.find((brand) => brand.value === value);
}
