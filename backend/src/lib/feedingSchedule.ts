export type MealScheduleItem = {
  id: string;
  label: string;
  time: string;
};

export const DEFAULT_FEEDING_SCHEDULE: MealScheduleItem[] = [
  { id: "morning", label: "Morning meal", time: "08:00" },
  { id: "evening", label: "Evening meal", time: "18:30" },
];

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidMealTime(time: string): boolean {
  return TIME_RE.test(time);
}

export function parseFeedingSchedule(raw: unknown): MealScheduleItem[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return DEFAULT_FEEDING_SCHEDULE;
  }

  const parsed = raw
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const fallback = DEFAULT_FEEDING_SCHEDULE[index] ?? DEFAULT_FEEDING_SCHEDULE[0];
      const time =
        typeof record.time === "string" && isValidMealTime(record.time)
          ? record.time
          : fallback.time;
      return {
        id: typeof record.id === "string" ? record.id : fallback.id,
        label: typeof record.label === "string" ? record.label : fallback.label,
        time,
      } satisfies MealScheduleItem;
    })
    .filter((item): item is MealScheduleItem => item !== null);

  if (parsed.length < DEFAULT_FEEDING_SCHEDULE.length) {
    return DEFAULT_FEEDING_SCHEDULE.map(
      (fallback, index) => parsed[index] ?? fallback
    );
  }

  return parsed.slice(0, DEFAULT_FEEDING_SCHEDULE.length);
}

export function parseFeedingScheduleJson(json: string | null | undefined): MealScheduleItem[] {
  if (!json) return DEFAULT_FEEDING_SCHEDULE;
  try {
    return parseFeedingSchedule(JSON.parse(json));
  } catch {
    return DEFAULT_FEEDING_SCHEDULE;
  }
}

export function serializeFeedingSchedule(schedule: MealScheduleItem[]): string {
  return JSON.stringify(schedule);
}

export function formatMealTime(time: string): string {
  if (!isValidMealTime(time)) return time;
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function toDisplaySchedule(schedule: MealScheduleItem[]) {
  return schedule.map((item) => ({
    id: item.id,
    label: item.label,
    time: formatMealTime(item.time),
  }));
}
