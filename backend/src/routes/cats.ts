import { Router } from "express";
import { z } from "zod";
import { foodBrandExists } from "../lib/foodBrands.js";
import {
  buildCatQrPayload,
  calculateDailyKcal,
  computeNutritionValues,
  getCurrentNutritionPlan,
  getTodayFeedingStatus,
  parseCatQrPayload,
  saveNutritionPlan,
} from "../lib/nutrition.js";
import { prisma } from "../lib/prisma.js";
import {
  serializeCat,
  serializeFeedingLog,
  serializeNutritionPlan,
  serializeWeightLog,
} from "../lib/serialize.js";
import { getUserFeedingSchedules } from "../lib/userSetup.js";
import { authenticate, type AuthedRequest } from "../middleware/authenticate.js";

export const catsRouter = Router();

catsRouter.use(authenticate);

const catBodySchema = z.object({
  name: z.string().min(1).max(80),
  photoUri: z.string().optional(),
  birthDate: z.string().min(1),
  weightKg: z.number().positive().max(30),
  sex: z.string().min(1),
  activityLevel: z.string().min(1),
  healthCondition: z.string().min(1),
  foodBrandValue: z.string().min(1),
});

const weightLogSchema = z.object({
  weightKg: z.number().positive().max(30),
  source: z.enum(["manual", "profile_update", "registration"]).optional(),
});

async function getUserCat(catId: string, userId: string) {
  return prisma.cat.findFirst({ where: { id: catId, userId } });
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

catsRouter.get("/", async (req: AuthedRequest, res) => {
  const cats = await prisma.cat.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: "asc" },
  });
  res.json({ cats: cats.map(serializeCat) });
});

catsRouter.get("/resolve-qr", async (req: AuthedRequest, res) => {
  const payload = typeof req.query.payload === "string" ? req.query.payload : "";
  const catId = parseCatQrPayload(payload);
  if (!catId) {
    res.status(400).json({ error: "Invalid QR payload" });
    return;
  }
  const cat = await getUserCat(catId, req.user!.userId);
  if (!cat) {
    res.status(404).json({ error: "Cat not found for this account" });
    return;
  }
  res.json({ cat: serializeCat(cat) });
});

catsRouter.get("/:id", async (req: AuthedRequest, res) => {
  const cat = await getUserCat(req.params.id, req.user!.userId);
  if (!cat) {
    res.status(404).json({ error: "Cat not found" });
    return;
  }
  res.json({ cat: serializeCat(cat) });
});

catsRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = catBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const data = parsed.data;
  if (!(await foodBrandExists(data.foodBrandValue))) {
    res.status(400).json({ error: "Invalid food brand" });
    return;
  }

  const cat = await prisma.cat.create({
    data: {
      userId: req.user!.userId,
      name: data.name.trim(),
      photoUri: data.photoUri,
      birthDate: new Date(data.birthDate),
      weightKg: data.weightKg,
      sex: data.sex,
      activityLevel: data.activityLevel,
      healthCondition: data.healthCondition,
      foodBrandValue: data.foodBrandValue,
      qrCode: "",
    },
  });

  const qrCode = buildCatQrPayload(cat.id);
  const updated = await prisma.cat.update({
    where: { id: cat.id },
    data: { qrCode },
  });

  await prisma.weightLog.create({
    data: {
      catId: updated.id,
      weightKg: updated.weightKg,
      source: "registration",
    },
  });

  const schedules = await getUserFeedingSchedules(req.user!.userId);
  await saveNutritionPlan(updated.id, updated, schedules.length);

  const profile = await prisma.profile.findUnique({
    where: { userId: req.user!.userId },
  });
  if (!profile?.activeCatId) {
    await prisma.profile.upsert({
      where: { userId: req.user!.userId },
      create: {
        userId: req.user!.userId,
        fullName: "CatCal User",
        activeCatId: updated.id,
      },
      update: { activeCatId: updated.id },
    });
  }

  res.status(201).json({ cat: serializeCat(updated) });
});

catsRouter.patch("/:id", async (req: AuthedRequest, res) => {
  const existing = await getUserCat(req.params.id, req.user!.userId);
  if (!existing) {
    res.status(404).json({ error: "Cat not found" });
    return;
  }

  const parsed = catBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const data = parsed.data;
  if (!(await foodBrandExists(data.foodBrandValue))) {
    res.status(400).json({ error: "Invalid food brand" });
    return;
  }

  const updated = await prisma.cat.update({
    where: { id: existing.id },
    data: {
      name: data.name.trim(),
      photoUri: data.photoUri,
      birthDate: new Date(data.birthDate),
      weightKg: data.weightKg,
      sex: data.sex,
      activityLevel: data.activityLevel,
      healthCondition: data.healthCondition,
      foodBrandValue: data.foodBrandValue,
    },
  });

  if (existing.weightKg !== updated.weightKg) {
    await prisma.weightLog.create({
      data: {
        catId: updated.id,
        weightKg: updated.weightKg,
        source: "profile_update",
      },
    });
  }

  const schedules = await getUserFeedingSchedules(req.user!.userId);
  await saveNutritionPlan(updated.id, updated, schedules.length);

  res.json({ cat: serializeCat(updated) });
});

catsRouter.delete("/:id", async (req: AuthedRequest, res) => {
  const existing = await getUserCat(req.params.id, req.user!.userId);
  if (!existing) {
    res.status(404).json({ error: "Cat not found" });
    return;
  }

  await prisma.cat.delete({ where: { id: existing.id } });

  const profile = await prisma.profile.findUnique({
    where: { userId: req.user!.userId },
  });
  if (profile?.activeCatId === existing.id) {
    const next = await prisma.cat.findFirst({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "asc" },
    });
    await prisma.profile.update({
      where: { userId: req.user!.userId },
      data: { activeCatId: next?.id ?? null },
    });
  }

  res.status(204).send();
});

catsRouter.get("/:id/calculate-calories", async (req: AuthedRequest, res) => {
  const cat = await getUserCat(req.params.id, req.user!.userId);
  if (!cat) {
    res.status(404).json({ error: "Cat not found" });
    return;
  }

  const schedules = await getUserFeedingSchedules(req.user!.userId);
  const computed = await computeNutritionValues(cat, schedules.length);

  res.json(computed);
});

catsRouter.get("/:id/plan", async (req: AuthedRequest, res) => {
  const cat = await getUserCat(req.params.id, req.user!.userId);
  if (!cat) {
    res.status(404).json({ error: "Cat not found" });
    return;
  }

  const schedules = await getUserFeedingSchedules(req.user!.userId);
  let plan = await getCurrentNutritionPlan(cat.id);
  if (!plan) {
    plan = await saveNutritionPlan(cat.id, cat, schedules.length);
  }

  res.json({
    plan: serializeNutritionPlan(
      plan,
      schedules.map((row) => ({
        id: row.id,
        label: row.label,
        time: row.time,
        sortOrder: row.sortOrder,
      }))
    ),
  });
});

catsRouter.post("/:id/plan", async (req: AuthedRequest, res) => {
  const cat = await getUserCat(req.params.id, req.user!.userId);
  if (!cat) {
    res.status(404).json({ error: "Cat not found" });
    return;
  }

  const schedules = await getUserFeedingSchedules(req.user!.userId);
  const plan = await saveNutritionPlan(cat.id, cat, schedules.length);

  res.status(201).json({
    plan: serializeNutritionPlan(
      plan,
      schedules.map((row) => ({
        id: row.id,
        label: row.label,
        time: row.time,
        sortOrder: row.sortOrder,
      }))
    ),
  });
});

catsRouter.get("/:id/upcoming-feeding", async (req: AuthedRequest, res) => {
  const cat = await getUserCat(req.params.id, req.user!.userId);
  if (!cat) {
    res.status(404).json({ error: "Cat not found" });
    return;
  }

  const schedules = await getUserFeedingSchedules(req.user!.userId);
  const todayLogs = await prisma.feedingLog.findMany({
    where: { catId: cat.id, fedAt: { gte: startOfToday() } },
    orderBy: { fedAt: "desc" },
  });
  const plan = await getCurrentNutritionPlan(cat.id);
  const status = await getTodayFeedingStatus(
    cat,
    todayLogs,
    schedules,
    plan ?? undefined
  );

  res.json({
    nextMealLabel: status.nextMealLabel,
    nextMealTime: status.nextMealTime,
    mealsDone: status.mealsDone,
    mealsTotal: status.mealsTotal,
    schedule: status.schedule,
  });
});

catsRouter.get("/:id/feeding-logs", async (req: AuthedRequest, res) => {
  const cat = await getUserCat(req.params.id, req.user!.userId);
  if (!cat) {
    res.status(404).json({ error: "Cat not found" });
    return;
  }
  const logs = await prisma.feedingLog.findMany({
    where: { catId: cat.id },
    orderBy: { fedAt: "desc" },
  });
  res.json({ logs: logs.map(serializeFeedingLog) });
});

catsRouter.get("/:id/feeding-status/today", async (req: AuthedRequest, res) => {
  const cat = await getUserCat(req.params.id, req.user!.userId);
  if (!cat) {
    res.status(404).json({ error: "Cat not found" });
    return;
  }

  const schedules = await getUserFeedingSchedules(req.user!.userId);
  const todayLogs = await prisma.feedingLog.findMany({
    where: { catId: cat.id, fedAt: { gte: startOfToday() } },
    orderBy: { fedAt: "desc" },
  });
  const plan = await getCurrentNutritionPlan(cat.id);
  const status = await getTodayFeedingStatus(
    cat,
    todayLogs,
    schedules,
    plan ?? undefined
  );

  res.json({
    mealsDone: status.mealsDone,
    mealsTotal: status.mealsTotal,
    kcalLeft: status.kcalLeft,
    nextMealLabel: status.nextMealLabel,
    nextMealTime: status.nextMealTime,
    recentLogs: todayLogs.map(serializeFeedingLog),
    plan: plan
      ? serializeNutritionPlan(
          plan,
          schedules.map((row) => ({
            id: row.id,
            label: row.label,
            time: row.time,
            sortOrder: row.sortOrder,
          }))
        )
      : null,
  });
});

catsRouter.post("/:id/feeding-logs", async (req: AuthedRequest, res) => {
  const cat = await getUserCat(req.params.id, req.user!.userId);
  if (!cat) {
    res.status(404).json({ error: "Cat not found" });
    return;
  }

  const mealLabel =
    typeof req.body?.mealLabel === "string" ? req.body.mealLabel : undefined;

  let fedAt: Date | undefined;
  if (typeof req.body?.fedAt === "string") {
    const parsedFedAt = new Date(req.body.fedAt);
    if (!Number.isNaN(parsedFedAt.getTime())) {
      fedAt = parsedFedAt;
    }
  }

  const schedules = await getUserFeedingSchedules(req.user!.userId);
  const todayLogs = await prisma.feedingLog.findMany({
    where: { catId: cat.id, fedAt: { gte: startOfToday() } },
  });
  const plan = await getCurrentNutritionPlan(cat.id);
  const status = await getTodayFeedingStatus(
    cat,
    todayLogs,
    schedules,
    plan ?? undefined
  );

  if (status.mealsDone >= status.mealsTotal) {
    res.status(409).json({ error: "All meals already logged for today" });
    return;
  }

  const scheduleItem = status.schedule[status.mealsDone] ?? status.schedule[0];
  const grams = plan?.gramsPerMeal ?? status.computed.gramsPerMeal;
  const kcal = plan?.kcalPerMeal ?? status.computed.kcalPerMeal;

  const log = await prisma.feedingLog.create({
    data: {
      catId: cat.id,
      mealLabel: mealLabel ?? scheduleItem.label,
      grams,
      kcal,
      ...(fedAt ? { fedAt } : {}),
    },
  });

  res.status(201).json({ log: serializeFeedingLog(log) });
});

catsRouter.get("/:id/weight-logs", async (req: AuthedRequest, res) => {
  const cat = await getUserCat(req.params.id, req.user!.userId);
  if (!cat) {
    res.status(404).json({ error: "Cat not found" });
    return;
  }
  const records = await prisma.weightLog.findMany({
    where: { catId: cat.id },
    orderBy: { recordedAt: "desc" },
  });
  res.json({ logs: records.map(serializeWeightLog) });
});

catsRouter.post("/:id/weight-logs", async (req: AuthedRequest, res) => {
  const cat = await getUserCat(req.params.id, req.user!.userId);
  if (!cat) {
    res.status(404).json({ error: "Cat not found" });
    return;
  }

  const parsed = weightLogSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const log = await prisma.weightLog.create({
    data: {
      catId: cat.id,
      weightKg: parsed.data.weightKg,
      source: parsed.data.source ?? "manual",
    },
  });

  if (parsed.data.weightKg !== cat.weightKg) {
    await prisma.cat.update({
      where: { id: cat.id },
      data: { weightKg: parsed.data.weightKg },
    });
    const schedules = await getUserFeedingSchedules(req.user!.userId);
    await saveNutritionPlan(cat.id, { ...cat, weightKg: parsed.data.weightKg }, schedules.length);
  }

  res.status(201).json({ log: serializeWeightLog(log) });
});

catsRouter.get("/:id/weight-progress", async (req: AuthedRequest, res) => {
  const cat = await getUserCat(req.params.id, req.user!.userId);
  if (!cat) {
    res.status(404).json({ error: "Cat not found" });
    return;
  }

  const logs = await prisma.weightLog.findMany({
    where: { catId: cat.id },
    orderBy: { recordedAt: "desc" },
    take: 30,
  });

  const current = logs[0]?.weightKg ?? cat.weightKg;
  const previous = logs[1]?.weightKg ?? current;
  const changeKg = Math.round((current - previous) * 10) / 10;

  res.json({
    currentWeightKg: current,
    previousWeightKg: previous,
    changeKg,
    trend: changeKg > 0 ? "up" : changeKg < 0 ? "down" : "stable",
    logs: logs.map(serializeWeightLog),
  });
});
