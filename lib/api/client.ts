import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  CatFormData,
  CatProfile,
  FeedingLog,
  FoodBrand,
  NutritionPlan,
  WeightRecord,
} from "../../types/cat";
import type { MealScheduleItem } from "../feedingSchedule";
import { lbsToKg } from "../nutrition";
import { API_BASE } from "./config";

const TOKEN_KEY = "@catcal/auth-token";
const REQUEST_TIMEOUT_MS = 12_000;
const AUTH_TIMEOUT_MS = 45_000;

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  activeCatId?: string | null;
  createdAt?: string;
};

export type UserProfile = AuthUser & {
  createdAt: string;
  updatedAt: string;
};

export type NotificationSettings = {
  remindersEnabled: boolean;
  notifyBeforeMinutes: number;
  pushEnabled: boolean;
};

export type FeedingScheduleRow = MealScheduleItem & { sortOrder?: number };

export type SyncPayload = {
  profile: UserProfile | null;
  cats: CatProfile[];
  feedingLogs: FeedingLog[];
  weightRecords: WeightRecord[];
  activeCatId: string | null;
  remindersEnabled: boolean;
  notificationSettings: NotificationSettings;
  feedingSchedule: MealScheduleItem[];
  foodBrands: FoodBrand[];
  plans: Record<string, NutritionPlan>;
};

export type DashboardSummary = {
  activeCat: CatProfile | null;
  catCount: number;
  plan: NutritionPlan | null;
  todayStatus: {
    mealsDone: number;
    mealsTotal: number;
    kcalLeft: number;
    nextMealLabel: string;
    nextMealTime: string;
  } | null;
};

export type RecentActivityItem =
  | { type: "feeding"; at: string; data: FeedingLog }
  | { type: "weight"; at: string; data: WeightRecord };

export type WeightProgress = {
  currentWeightKg: number;
  previousWeightKg: number;
  changeKg: number;
  trend: "up" | "down" | "stable";
  logs: WeightRecord[];
};

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setAuthToken(token: string | null) {
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
  timeoutMs = REQUEST_TIMEOUT_MS
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError(
        `Server took too long to respond. Check that the API is running at ${API_BASE.replace("/api", "")}.`,
        0
      );
    }
    throw new ApiError(
      `Cannot reach the server at ${API_BASE.replace("/api", "")}. Start the backend and use your PC's Wi‑Fi IP in .env.`,
      0
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof data.error === "string"
        ? data.error
        : "Request failed. Check your connection.";
    throw new ApiError(message, response.status);
  }

  return data as T;
}

function formToApiBody(form: CatFormData) {
  const weightKg =
    form.weightUnit === "lbs"
      ? lbsToKg(parseFloat(form.weightKg) || 0)
      : parseFloat(form.weightKg) || 0;

  return {
    name: form.name.trim(),
    photoUri: form.photoUri,
    birthDate: form.birthDate.toISOString(),
    weightKg: Math.round(weightKg * 10) / 10,
    sex: form.sex,
    activityLevel: form.activityLevel,
    healthCondition: form.healthCondition,
    foodBrandValue: form.foodBrandValue,
  };
}

export const api = {
  register(fullName: string, email: string, password: string) {
    return request<{ token: string; user: AuthUser }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ fullName, email, password }),
      },
      false,
      AUTH_TIMEOUT_MS
    );
  },

  login(email: string, password: string) {
    return request<{ token: string; user: AuthUser }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      false,
      AUTH_TIMEOUT_MS
    );
  },

  forgotPassword(email: string) {
    return request<{ message: string; devResetCode?: string }>(
      "/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      },
      false,
      AUTH_TIMEOUT_MS
    );
  },

  resetPassword(email: string, code: string, password: string) {
    return request<{ message: string }>(
      "/auth/reset-password",
      {
        method: "POST",
        body: JSON.stringify({ email, code, password }),
      },
      false,
      AUTH_TIMEOUT_MS
    );
  },

  logout() {
    return request<void>("/auth/logout", { method: "POST" });
  },

  me() {
    return request<{ profile: UserProfile }>("/auth/me");
  },

  getProfile() {
    return request<{ profile: UserProfile }>("/profile");
  },

  updateProfile(body: {
    fullName?: string;
    email?: string;
    password?: string;
    currentPassword?: string;
  }) {
    return request<{ profile: UserProfile }>("/profile", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  getSettings() {
    return request<{ activeCatId: string | null }>("/settings");
  },

  updateSettings(body: { activeCatId?: string | null }) {
    return request<{ activeCatId: string | null }>("/settings", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  sync() {
    return request<SyncPayload>("/me/sync");
  },

  getDashboardSummary() {
    return request<DashboardSummary>("/dashboard/summary");
  },

  getRecentActivity(limit = 20) {
    return request<{ activity: RecentActivityItem[] }>(
      `/dashboard/recent-activity?limit=${limit}`
    );
  },

  getFoodBrands() {
    return request<{ brands: FoodBrand[] }>("/food-brands", {}, false);
  },

  getCats() {
    return request<{ cats: CatProfile[] }>("/cats");
  },

  getCat(id: string) {
    return request<{ cat: CatProfile }>(`/cats/${id}`);
  },

  createCat(form: CatFormData) {
    return request<{ cat: CatProfile }>("/cats", {
      method: "POST",
      body: JSON.stringify(formToApiBody(form)),
    });
  },

  updateCat(id: string, form: CatFormData) {
    return request<{ cat: CatProfile }>(`/cats/${id}`, {
      method: "PATCH",
      body: JSON.stringify(formToApiBody(form)),
    });
  },

  deleteCat(id: string) {
    return request<void>(`/cats/${id}`, { method: "DELETE" });
  },

  resolveQr(payload: string) {
    return request<{ cat: CatProfile }>(
      `/cats/resolve-qr?payload=${encodeURIComponent(payload)}`
    );
  },

  calculateCalories(catId: string) {
    return request<{
      rer: number;
      dailyKcal: number;
      kcalPerMeal: number;
      gramsPerDay: number;
      gramsPerMeal: number;
      mealsTotal: number;
    }>(`/cats/${catId}/calculate-calories`);
  },

  getPlan(catId: string) {
    return request<{ plan: NutritionPlan }>(`/cats/${catId}/plan`);
  },

  savePlan(catId: string) {
    return request<{ plan: NutritionPlan }>(`/cats/${catId}/plan`, {
      method: "POST",
    });
  },

  getUpcomingFeeding(catId: string) {
    return request<{
      nextMealLabel: string;
      nextMealTime: string;
      mealsDone: number;
      mealsTotal: number;
      schedule: NutritionPlan["schedule"];
    }>(`/cats/${catId}/upcoming-feeding`);
  },

  getTodayFeedingStatus(catId: string) {
    return request<{
      mealsDone: number;
      mealsTotal: number;
      kcalLeft: number;
      nextMealLabel: string;
      nextMealTime: string;
      recentLogs: FeedingLog[];
      plan: NutritionPlan | null;
    }>(`/cats/${catId}/feeding-status/today`);
  },

  getFeedingHistory(catId: string) {
    return request<{ logs: FeedingLog[] }>(`/cats/${catId}/feeding-logs`);
  },

  markFed(
    catId: string,
    options?: { mealLabel?: string; fedAt?: string }
  ) {
    const body: { mealLabel?: string; fedAt?: string } = {};
    if (options?.mealLabel) body.mealLabel = options.mealLabel;
    if (options?.fedAt) body.fedAt = options.fedAt;
    return request<{ log: FeedingLog }>(`/cats/${catId}/feeding-logs`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  getWeightHistory(catId: string) {
    return request<{ logs: WeightRecord[] }>(`/cats/${catId}/weight-logs`);
  },

  addWeightLog(catId: string, weightKg: number, source: WeightRecord["source"] = "manual") {
    return request<{ log: WeightRecord }>(`/cats/${catId}/weight-logs`, {
      method: "POST",
      body: JSON.stringify({ weightKg, source }),
    });
  },

  getWeightProgress(catId: string) {
    return request<WeightProgress>(`/cats/${catId}/weight-progress`);
  },

  getFeedingSchedules() {
    return request<{ schedules: FeedingScheduleRow[] }>("/feeding-schedules");
  },

  addFeedingSchedule(body: { label: string; time: string; sortOrder?: number }) {
    return request<{ schedule: FeedingScheduleRow }>("/feeding-schedules", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  updateFeedingSchedule(
    id: string,
    body: Partial<{ label: string; time: string; sortOrder: number }>
  ) {
    return request<{ schedule: FeedingScheduleRow }>(`/feeding-schedules/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  deleteFeedingSchedule(id: string) {
    return request<void>(`/feeding-schedules/${id}`, { method: "DELETE" });
  },

  getNotificationSettings() {
    return request<{ settings: NotificationSettings }>("/notification-settings");
  },

  updateNotificationSettings(body: Partial<NotificationSettings>) {
    return request<{ settings: NotificationSettings }>("/notification-settings", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  setPreferences(prefs: {
    activeCatId?: string | null;
    remindersEnabled?: boolean;
    feedingSchedule?: MealScheduleItem[];
  }) {
    return request<{
      activeCatId: string | null;
      remindersEnabled: boolean;
      feedingSchedule: MealScheduleItem[];
    }>("/me/preferences", {
      method: "PATCH",
      body: JSON.stringify(prefs),
    });
  },
};

export { ApiError };
