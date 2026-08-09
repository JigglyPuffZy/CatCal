import { FOOD_BRANDS } from "../constants/foodBrands.js";
import { prisma } from "./prisma.js";

export type FoodBrandRecord = {
  value: string;
  label: string;
  kcalPer100g: number;
};

let cache: FoodBrandRecord[] | null = null;
let cacheAt = 0;
const CACHE_TTL_MS = 60_000;

function fromConstants(): FoodBrandRecord[] {
  return FOOD_BRANDS.map((brand) => ({
    value: brand.value,
    label: brand.label,
    kcalPer100g: brand.kcalPer100g,
  }));
}

export function invalidateFoodBrandCache() {
  cache = null;
  cacheAt = 0;
}

export async function ensureFoodBrandsSeeded() {
  const count = await prisma.foodBrand.count();
  if (count > 0) return;

  await prisma.foodBrand.createMany({
    data: fromConstants(),
  });
  invalidateFoodBrandCache();
}

export async function listFoodBrands(): Promise<FoodBrandRecord[]> {
  if (cache && Date.now() - cacheAt < CACHE_TTL_MS) {
    return cache;
  }

  try {
    const rows = await prisma.foodBrand.findMany({ orderBy: { label: "asc" } });
    cache = rows.length > 0 ? rows : fromConstants();
  } catch {
    cache = fromConstants();
  }

  cacheAt = Date.now();
  return cache;
}

export async function resolveFoodBrand(
  value: string
): Promise<FoodBrandRecord | undefined> {
  const brands = await listFoodBrands();
  return brands.find((brand) => brand.value === value);
}

export async function foodBrandExists(value: string): Promise<boolean> {
  return Boolean(await resolveFoodBrand(value));
}
