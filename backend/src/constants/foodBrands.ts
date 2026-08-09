export const FOOD_BRANDS = [
  { label: "Royal Canin Indoor", value: "royal-canin-indoor", kcalPer100g: 353 },
  { label: "Purina Pro Plan Adult", value: "purina-pro-plan", kcalPer100g: 436 },
  { label: "Hill's Science Diet", value: "hills-science", kcalPer100g: 352 },
  { label: "Whiskas Dry Adult", value: "whiskas-dry", kcalPer100g: 340 },
  { label: "Blue Buffalo Indoor", value: "blue-buffalo", kcalPer100g: 372 },
] as const;

export const MEALS_PER_DAY = 2;

export const DEFAULT_SCHEDULE = [
  { id: "morning", label: "Morning meal", time: "8:00 AM" },
  { id: "evening", label: "Evening meal", time: "6:30 PM" },
] as const;

export function getFoodBrand(value: string) {
  return FOOD_BRANDS.find((brand) => brand.value === value);
}
