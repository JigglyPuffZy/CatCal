import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CatProfile, FeedingLog, WeightRecord } from "../types/cat";
import type { MealScheduleItem } from "./feedingSchedule";

const STORAGE_KEY = "@catcal/state";

export type CatCalPersistedState = {
  cats: CatProfile[];
  activeCatId: string | null;
  feedingLogs: FeedingLog[];
  weightRecords: WeightRecord[];
  remindersEnabled: boolean;
  feedingSchedule?: MealScheduleItem[];
};

export async function loadCatCalState(): Promise<CatCalPersistedState | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CatCalPersistedState;
  } catch {
    return null;
  }
}

export async function saveCatCalState(state: CatCalPersistedState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore write failures — app keeps working in memory.
  }
}
