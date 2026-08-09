import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { LoadingView } from "../components/LoadingOverlay";
import { FOOD_BRANDS } from "../constants/foodBrands";
import {
  buildNutritionPlan,
  generateQrCode,
  lbsToKg,
} from "../lib/nutrition";
import {
  DEFAULT_FEEDING_SCHEDULE,
  parseFeedingSchedule,
  toDisplaySchedule,
  updateMealTime as updateMealTimeInSchedule,
  addMealSlot as addMealSlotInSchedule,
  removeMealSlot as removeMealSlotInSchedule,
  type MealScheduleItem,
} from "../lib/feedingSchedule";
import { loadCatCalState, saveCatCalState } from "../lib/storage";
import { api } from "../lib/api/client";
import { useAuth } from "./AuthContext";
import type {
  CatFormData,
  CatProfile,
  FeedingLog,
  FoodBrand,
  NutritionPlan,
  WeightRecord,
} from "../types/cat";
import { buildCatQrPayload, parseCatQrPayload } from "../lib/qr";

const DEFAULT_CAT_ID = "cat-mochi";

function createDefaultCat(): CatProfile {
  return {
    id: DEFAULT_CAT_ID,
    name: "Mochi",
    birthDate: new Date(2022, 5, 15).toISOString(),
    weightKg: 4.1,
    sex: "female",
    activityLevel: "light",
    healthCondition: "healthy",
    foodBrandValue: "royal-canin-indoor",
    qrCode: generateQrCode(DEFAULT_CAT_ID),
    createdAt: new Date().toISOString(),
  };
}

function createDefaultWeightRecords(): WeightRecord[] {
  const now = new Date();
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

  return [
    {
      id: "weight-1",
      catId: DEFAULT_CAT_ID,
      weightKg: 4.1,
      recordedAt: now.toISOString(),
      source: "profile_update",
    },
    {
      id: "weight-2",
      catId: DEFAULT_CAT_ID,
      weightKg: 4.2,
      recordedAt: twoWeeksAgo.toISOString(),
      source: "profile_update",
    },
    {
      id: "weight-3",
      catId: DEFAULT_CAT_ID,
      weightKg: 4.3,
      recordedAt: oneMonthAgo.toISOString(),
      source: "registration",
    },
  ];
}

const EMPTY_FEEDING_STATUS = {
  mealsDone: 0,
  mealsTotal: DEFAULT_FEEDING_SCHEDULE.length,
  kcalLeft: 0,
  nextMealLabel: "Next meal",
  nextMealTime: "—",
  recentLogs: [] as FeedingLog[],
};

type CatFeedingContextValue = {
  cats: CatProfile[];
  activeCatId: string | null;
  feedingLogs: FeedingLog[];
  weightRecords: WeightRecord[];
  activeCat: CatProfile | null;
  activePlan: NutritionPlan | null;
  hydrated: boolean;
  setActiveCatId: (id: string) => void;
  addCat: (form: CatFormData) => Promise<CatProfile>;
  updateCat: (id: string, form: CatFormData) => Promise<CatProfile>;
  getCat: (id: string) => CatProfile | undefined;
  getPlan: (catId: string) => NutritionPlan | null;
  getFeedingHistory: (catId: string) => FeedingLog[];
  getWeightHistory: (catId: string) => WeightRecord[];
  resolveCatFromQr: (payload: string) => Promise<CatProfile | undefined>;
  markAsFed: (
    catId: string,
    options?: { mealLabel?: string; fedAt?: string }
  ) => Promise<FeedingLog | null>;
  getTodayFeedingStatus: (catId: string) => {
    mealsDone: number;
    mealsTotal: number;
    kcalLeft: number;
    nextMealLabel: string;
    nextMealTime: string;
    recentLogs: FeedingLog[];
  };
  remindersEnabled: boolean;
  setRemindersEnabled: (enabled: boolean) => void;
  feedingSchedule: MealScheduleItem[];
  setMealTime: (mealId: string, time: string) => void;
  addMealSlot: () => void;
  removeMealSlot: (mealId: string) => void;
  foodBrands: FoodBrand[];
};

const CatFeedingContext = createContext<CatFeedingContextValue | null>(null);

function formToProfile(id: string, form: CatFormData, existing?: CatProfile): CatProfile {
  const weight =
    form.weightUnit === "lbs"
      ? lbsToKg(parseFloat(form.weightKg) || 0)
      : parseFloat(form.weightKg) || 0;

  return {
    id,
    name: form.name.trim(),
    photoUri: form.photoUri,
    birthDate: form.birthDate.toISOString(),
    weightKg: Math.round(weight * 10) / 10,
    sex: form.sex,
    activityLevel: form.activityLevel,
    healthCondition: form.healthCondition,
    foodBrandValue: form.foodBrandValue,
    qrCode: existing?.qrCode ?? buildCatQrPayload(id),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
}

export function CatFeedingProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [cats, setCats] = useState<CatProfile[]>([]);
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [feedingLogs, setFeedingLogs] = useState<FeedingLog[]>([]);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [feedingSchedule, setFeedingSchedule] = useState<MealScheduleItem[]>(
    DEFAULT_FEEDING_SCHEDULE
  );
  const [plansByCatId, setPlansByCatId] = useState<Record<string, NutritionPlan>>({});
  const [foodBrands, setFoodBrands] = useState<FoodBrand[]>(FOOD_BRANDS);
  const skipSaveRef = useRef(true);
  const hasHydratedOnceRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    api
      .getFoodBrands()
      .then(({ brands }) => {
        if (mounted && brands.length > 0) setFoodBrands(brands);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (authLoading) return;

    let mounted = true;
    setHydrated(false);
    skipSaveRef.current = true;

    const load = async () => {
      try {
        if (isAuthenticated) {
          const data = await api.sync();
          if (!mounted) return;
          setCats(data.cats);
          setActiveCatId(data.activeCatId);
          setFeedingLogs(data.feedingLogs);
          setWeightRecords(data.weightRecords);
          setRemindersEnabled(data.remindersEnabled);
          setFeedingSchedule(parseFeedingSchedule(data.feedingSchedule));
          setPlansByCatId(data.plans ?? {});
          if (data.foodBrands?.length) setFoodBrands(data.foodBrands);
        } else {
          const saved = await loadCatCalState();
          if (!mounted) return;
          if (saved?.cats?.length) {
            setCats(saved.cats);
            setActiveCatId(saved.activeCatId);
            setFeedingLogs(saved.feedingLogs ?? []);
            setWeightRecords(saved.weightRecords ?? []);
            setRemindersEnabled(saved.remindersEnabled ?? true);
            setFeedingSchedule(parseFeedingSchedule(saved.feedingSchedule));
            setPlansByCatId({});
          } else {
            setCats([createDefaultCat()]);
            setActiveCatId(DEFAULT_CAT_ID);
            setFeedingLogs([]);
            setWeightRecords(createDefaultWeightRecords());
            setPlansByCatId({});
          }
        }
      } finally {
        if (mounted) {
          skipSaveRef.current = false;
          setHydrated(true);
          hasHydratedOnceRef.current = true;
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (!hydrated || skipSaveRef.current || isAuthenticated) return;
    saveCatCalState({
      cats,
      activeCatId,
      feedingLogs,
      weightRecords,
      remindersEnabled,
      feedingSchedule,
    });
  }, [hydrated, isAuthenticated, cats, activeCatId, feedingLogs, weightRecords, remindersEnabled, feedingSchedule]);

  useEffect(() => {
    if (!activeCatId) return;
    if (!cats.some((cat) => cat.id === activeCatId) && cats[0]) {
      setActiveCatId(cats[0].id);
    }
  }, [cats, activeCatId]);

  const appendWeightRecord = useCallback(
    (
      catId: string,
      weightKg: number,
      source: WeightRecord["source"],
      previousWeight?: number
    ) => {
      if (previousWeight !== undefined && previousWeight === weightKg) return;
      setWeightRecords((prev) => [
        {
          id: `weight-${Date.now()}`,
          catId,
          weightKg,
          recordedAt: new Date().toISOString(),
          source,
        },
        ...prev,
      ]);
    },
    []
  );

  const activeCat = useMemo(() => {
    if (activeCatId) {
      const match = cats.find((cat) => cat.id === activeCatId);
      if (match) return match;
    }
    return cats[0] ?? null;
  }, [cats, activeCatId]);

  const applyScheduleToPlan = useCallback(
    (plan: NutritionPlan): NutritionPlan => {
      const mealCount = Math.max(feedingSchedule.length, 1);
      return {
        ...plan,
        gramsPerMeal: Math.floor(plan.gramsPerDay / mealCount),
        kcalPerMeal: Math.floor(plan.dailyKcal / mealCount),
        schedule: toDisplaySchedule(feedingSchedule),
      };
    },
    [feedingSchedule]
  );

  const activePlan = useMemo(() => {
    if (!activeCat) return null;
    if (isAuthenticated) {
      const plan =
        plansByCatId[activeCat.id] ??
        buildNutritionPlan(activeCat, foodBrands, feedingSchedule);
      return applyScheduleToPlan(plan);
    }
    return buildNutritionPlan(activeCat, foodBrands, feedingSchedule);
  }, [activeCat, isAuthenticated, plansByCatId, foodBrands, feedingSchedule, applyScheduleToPlan]);

  const getCat = useCallback(
    (id: string) => cats.find((cat) => cat.id === id),
    [cats]
  );

  const getFeedingHistory = useCallback(
    (catId: string) =>
      feedingLogs
        .filter((log) => log.catId === catId)
        .sort(
          (a, b) => new Date(b.fedAt).getTime() - new Date(a.fedAt).getTime()
        ),
    [feedingLogs]
  );

  const getWeightHistory = useCallback(
    (catId: string) =>
      weightRecords
        .filter((record) => record.catId === catId)
        .sort(
          (a, b) =>
            new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
        ),
    [weightRecords]
  );

  const resolveCatFromQr = useCallback(
    async (payload: string) => {
      if (isAuthenticated) {
        try {
          const { cat } = await api.resolveQr(payload);
          return cat;
        } catch {
          return undefined;
        }
      }
      const catId = parseCatQrPayload(payload);
      if (!catId) return undefined;
      return cats.find((cat) => cat.id === catId);
    },
    [cats, isAuthenticated]
  );

  const getPlan = useCallback(
    (catId: string): NutritionPlan | null => {
      const cat = cats.find((c) => c.id === catId);
      if (!cat) return null;
      if (isAuthenticated) {
        const plan =
          plansByCatId[catId] ??
          buildNutritionPlan(cat, foodBrands, feedingSchedule);
        return applyScheduleToPlan(plan);
      }
      return buildNutritionPlan(cat, foodBrands, feedingSchedule);
    },
    [cats, isAuthenticated, plansByCatId, foodBrands, feedingSchedule, applyScheduleToPlan]
  );

  const addCat = useCallback(
    async (form: CatFormData) => {
      if (isAuthenticated) {
        const { cat } = await api.createCat(form);
        setCats((prev) => [...prev, cat]);
        setActiveCatId(cat.id);
        const data = await api.sync();
        setWeightRecords(data.weightRecords);
        setPlansByCatId(data.plans ?? {});
        if (data.foodBrands?.length) setFoodBrands(data.foodBrands);
        return cat;
      }

      const id = `cat-${Date.now()}`;
      const profile = formToProfile(id, form);
      setCats((prev) => [...prev, profile]);
      setActiveCatId(id);
      appendWeightRecord(profile.id, profile.weightKg, "registration");
      return profile;
    },
    [appendWeightRecord, isAuthenticated]
  );

  const updateCat = useCallback(
    async (id: string, form: CatFormData) => {
      if (isAuthenticated) {
        const { cat } = await api.updateCat(id, form);
        setCats((prev) => prev.map((c) => (c.id === id ? cat : c)));
        const data = await api.sync();
        setWeightRecords(data.weightRecords);
        setPlansByCatId(data.plans ?? {});
        if (data.foodBrands?.length) setFoodBrands(data.foodBrands);
        return cat;
      }

      const existing = cats.find((c) => c.id === id);
      const profile = formToProfile(id, form, existing);
      setCats((prev) => prev.map((cat) => (cat.id === id ? profile : cat)));
      appendWeightRecord(
        profile.id,
        profile.weightKg,
        "profile_update",
        existing?.weightKg
      );
      return profile;
    },
    [cats, appendWeightRecord, isAuthenticated]
  );

  const getTodayFeedingStatus = useCallback(
    (catId: string) => {
      const plan = getPlan(catId);
      if (!plan) return EMPTY_FEEDING_STATUS;

      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayLogs = feedingLogs
        .filter((log) => {
          if (log.catId !== catId) return false;
          const fed = new Date(log.fedAt);
          return fed >= start;
        })
        .sort(
          (a, b) => new Date(b.fedAt).getTime() - new Date(a.fedAt).getTime()
        );

      const mealsDone = todayLogs.length;
      const mealsTotal = Math.max(plan.schedule.length, 1);
      const kcalFed = todayLogs.reduce((sum, log) => sum + log.kcal, 0);
      const kcalLeft = Math.max(plan.dailyKcal - kcalFed, 0);

      const nextSchedule =
        plan.schedule[mealsDone] ?? plan.schedule[plan.schedule.length - 1];

      return {
        mealsDone: Math.min(mealsDone, mealsTotal),
        mealsTotal,
        kcalLeft,
        nextMealLabel: nextSchedule?.label ?? "Next meal",
        nextMealTime: nextSchedule?.time ?? "—",
        recentLogs: todayLogs,
      };
    },
    [feedingLogs, getPlan]
  );

  const persistSchedule = useCallback(
    (next: MealScheduleItem[]) => {
      if (isAuthenticated) {
        void api.setPreferences({ feedingSchedule: next });
      }
    },
    [isAuthenticated]
  );

  const markAsFed = useCallback(
    async (
      catId: string,
      options?: { mealLabel?: string; fedAt?: string }
    ): Promise<FeedingLog | null> => {
      if (isAuthenticated) {
        try {
          const { log } = await api.markFed(catId, options);
          setFeedingLogs((prev) => [log, ...prev]);
          return log;
        } catch {
          return null;
        }
      }

      const plan = getPlan(catId);
      if (!plan) return null;

      const status = getTodayFeedingStatus(catId);
      if (status.mealsDone >= status.mealsTotal) return null;

      const scheduleItem =
        plan.schedule[status.mealsDone] ?? plan.schedule[0];

      const log: FeedingLog = {
        id: `feed-${Date.now()}`,
        catId,
        mealLabel: options?.mealLabel ?? scheduleItem.label,
        grams: plan.gramsPerMeal,
        kcal: plan.kcalPerMeal,
        fedAt: options?.fedAt ?? new Date().toISOString(),
      };

      setFeedingLogs((prev) => [log, ...prev]);
      return log;
    },
    [getPlan, getTodayFeedingStatus, isAuthenticated]
  );

  const selectActiveCat = useCallback(
    (id: string) => {
      setActiveCatId(id);
      if (isAuthenticated) {
        void api.updateSettings({ activeCatId: id });
      }
    },
    [isAuthenticated]
  );

  const updateReminders = useCallback(
    (enabled: boolean) => {
      setRemindersEnabled(enabled);
      if (isAuthenticated) {
        void api.updateNotificationSettings({ remindersEnabled: enabled });
      }
    },
    [isAuthenticated]
  );

  const setMealTime = useCallback(
    (mealId: string, time: string) => {
      setFeedingSchedule((prev) => {
        const next = updateMealTimeInSchedule(prev, mealId, time);
        persistSchedule(next);
        return next;
      });
    },
    [persistSchedule]
  );

  const addMealSlot = useCallback(() => {
    setFeedingSchedule((prev) => {
      const next = addMealSlotInSchedule(prev);
      persistSchedule(next);
      return next;
    });
  }, [persistSchedule]);

  const removeMealSlot = useCallback(
    (mealId: string) => {
      setFeedingSchedule((prev) => {
        const next = removeMealSlotInSchedule(prev, mealId);
        persistSchedule(next);
        return next;
      });
    },
    [persistSchedule]
  );

  const value = useMemo(
    () => ({
      cats,
      activeCatId,
      feedingLogs,
      weightRecords,
      activeCat,
      activePlan,
      hydrated,
      setActiveCatId: selectActiveCat,
      addCat,
      updateCat,
      getCat,
      getPlan,
      getFeedingHistory,
      getWeightHistory,
      resolveCatFromQr,
      markAsFed,
      getTodayFeedingStatus,
      remindersEnabled,
      setRemindersEnabled: updateReminders,
      feedingSchedule,
      setMealTime,
      addMealSlot,
      removeMealSlot,
      foodBrands,
    }),
    [
      cats,
      activeCatId,
      feedingLogs,
      weightRecords,
      activeCat,
      activePlan,
      hydrated,
      selectActiveCat,
      addCat,
      updateCat,
      getCat,
      getPlan,
      getFeedingHistory,
      getWeightHistory,
      resolveCatFromQr,
      markAsFed,
      getTodayFeedingStatus,
      remindersEnabled,
      updateReminders,
      feedingSchedule,
      setMealTime,
      addMealSlot,
      removeMealSlot,
      foodBrands,
    ]
  );

  return (
    <CatFeedingContext.Provider value={value}>
      {hydrated ? (
        children
      ) : (
        <LoadingView
          message={isAuthenticated ? "Syncing your cats…" : "Loading CatCal…"}
          hint="Please wait — this can take a moment on slow connections."
        />
      )}
    </CatFeedingContext.Provider>
  );
}

export function useCatFeeding() {
  const context = useContext(CatFeedingContext);
  if (!context) {
    throw new Error("useCatFeeding must be used within CatFeedingProvider");
  }
  return context;
}
