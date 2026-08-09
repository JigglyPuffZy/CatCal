export type MealScheduleItem = {
  id: string;
  label: string;
  /** 24-hour time, e.g. "08:00" */
  time: string;
};

export type MealScheduleDisplayItem = {
  id: string;
  label: string;
  /** Localized display, e.g. "8:00 AM" */
  time: string;
};

export const DEFAULT_FEEDING_SCHEDULE: MealScheduleItem[] = [
  { id: "morning", label: "Morning meal", time: "08:00" },
  { id: "evening", label: "Evening meal", time: "18:30" },
];

export const PH_TIMEZONE = "Asia/Manila";
export const MAX_MEALS_PER_DAY = 6;

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

  if (parsed.length === 0) {
    return DEFAULT_FEEDING_SCHEDULE;
  }

  return parsed.slice(0, MAX_MEALS_PER_DAY);
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

export function mealTimeToDate(time: string, base = new Date()): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(base);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function dateToMealTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function formatMealTime(time: string): string {
  if (!isValidMealTime(time)) return time;
  return mealTimeToDate(time).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function toDisplaySchedule(
  schedule: MealScheduleItem[]
): MealScheduleDisplayItem[] {
  return schedule.map((item) => ({
    id: item.id,
    label: item.label,
    time: formatMealTime(item.time),
  }));
}

export function updateMealTime(
  schedule: MealScheduleItem[],
  mealId: string,
  time: string
): MealScheduleItem[] {
  if (!isValidMealTime(time)) return schedule;
  return schedule.map((item) =>
    item.id === mealId ? { ...item, time } : item
  );
}

export function getMealTimeInTimezone(
  timeZone = PH_TIMEZONE,
  date = new Date()
): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hour12: false,
      timeZone,
    }).format(date)
  );
  const minute = new Intl.DateTimeFormat("en-GB", {
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(date);
  return `${String(hour % 24).padStart(2, "0")}:${minute}`;
}

/** Combine today's calendar date (PH) with HH:mm → ISO for feeding logs. */
export function mealTimeToTodayIso(
  time: string,
  timeZone = PH_TIMEZONE
): string {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [year, month, day] = ymd.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0).toISOString();
}

export function addMealSlot(schedule: MealScheduleItem[]): MealScheduleItem[] {
  if (schedule.length >= MAX_MEALS_PER_DAY) return schedule;
  const n = schedule.length + 1;
  return [
    ...schedule,
    {
      id: `meal-${Date.now()}`,
      label: `Meal ${n}`,
      time: "12:00",
    },
  ];
}

export function removeMealSlot(
  schedule: MealScheduleItem[],
  mealId: string
): MealScheduleItem[] {
  if (schedule.length <= 1) return schedule;
  return schedule.filter((item) => item.id !== mealId);
}
