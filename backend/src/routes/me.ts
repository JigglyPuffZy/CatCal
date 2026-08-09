import { Router } from "express";
import { z } from "zod";
import { parseFeedingSchedule } from "../lib/feedingSchedule.js";
import { listFoodBrands } from "../lib/foodBrands.js";
import { getCurrentNutritionPlan } from "../lib/nutrition.js";
import { prisma } from "../lib/prisma.js";
import {
  serializeCat,
  serializeFeedingLog,
  serializeFeedingSchedule,
  serializeNotificationSettings,
  serializeNutritionPlan,
  serializeProfile,
  serializeWeightLog,
} from "../lib/serialize.js";
import { getUserFeedingSchedules } from "../lib/userSetup.js";
import { authenticate, type AuthedRequest } from "../middleware/authenticate.js";

export const meRouter = Router();

meRouter.use(authenticate);

/** Legacy preferences endpoint — maps to profile + notification + feeding schedules. */
meRouter.get("/preferences", async (req: AuthedRequest, res) => {
  const userId = req.user!.userId;
  const [user, profile, settings, schedules] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, include: { profile: true } }),
    prisma.profile.findUnique({ where: { userId } }),
    prisma.notificationSettings.findUnique({ where: { userId } }),
    getUserFeedingSchedules(userId),
  ]);

  res.json({
    profile: user ? serializeProfile(user, profile) : null,
    activeCatId: profile?.activeCatId ?? null,
    remindersEnabled: settings?.remindersEnabled ?? true,
    feedingSchedule: schedules.map((row) => ({
      id: row.id,
      label: row.label,
      time: row.time,
    })),
    notificationSettings: settings
      ? serializeNotificationSettings(settings)
      : null,
  });
});

const legacyPrefsSchema = z.object({
  activeCatId: z.string().nullable().optional(),
  remindersEnabled: z.boolean().optional(),
  feedingSchedule: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        time: z.string(),
      })
    )
    .optional(),
});

meRouter.patch("/preferences", async (req: AuthedRequest, res) => {
  const parsed = legacyPrefsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const userId = req.user!.userId;

  if (parsed.data.activeCatId) {
    const cat = await prisma.cat.findFirst({
      where: { id: parsed.data.activeCatId, userId },
    });
    if (!cat) {
      res.status(400).json({ error: "Active cat not found" });
      return;
    }
  }

  if (parsed.data.feedingSchedule) {
    const normalized = parseFeedingSchedule(parsed.data.feedingSchedule);
    await prisma.feedingSchedule.deleteMany({ where: { userId } });
    await prisma.feedingSchedule.createMany({
      data: normalized.map((item, index) => ({
        userId,
        label: item.label,
        time: item.time,
        sortOrder: index,
      })),
    });
  }

  const profile = await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      fullName: "CatCal User",
      activeCatId: parsed.data.activeCatId ?? null,
    },
    update: {
      ...(parsed.data.activeCatId !== undefined
        ? { activeCatId: parsed.data.activeCatId }
        : {}),
    },
  });

  const settings = await prisma.notificationSettings.upsert({
    where: { userId },
    create: {
      userId,
      remindersEnabled: parsed.data.remindersEnabled ?? true,
    },
    update: {
      ...(parsed.data.remindersEnabled !== undefined
        ? { remindersEnabled: parsed.data.remindersEnabled }
        : {}),
    },
  });

  const schedules = await getUserFeedingSchedules(userId);

  res.json({
    activeCatId: profile.activeCatId,
    remindersEnabled: settings.remindersEnabled,
    feedingSchedule: schedules.map((row) => ({
      id: row.id,
      label: row.label,
      time: row.time,
    })),
  });
});

/** Full sync payload for the mobile app. */
meRouter.get("/sync", async (req: AuthedRequest, res) => {
  const userId = req.user!.userId;
  const [user, cats, feedingLogs, weightLogs, profile, settings, schedules, foodBrands] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, include: { profile: true } }),
      prisma.cat.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
      prisma.feedingLog.findMany({
        where: { cat: { userId } },
        orderBy: { fedAt: "desc" },
      }),
      prisma.weightLog.findMany({
        where: { cat: { userId } },
        orderBy: { recordedAt: "desc" },
      }),
      prisma.profile.findUnique({ where: { userId } }),
      prisma.notificationSettings.findUnique({ where: { userId } }),
      getUserFeedingSchedules(userId),
      listFoodBrands(),
    ]);

  const plans: Record<string, ReturnType<typeof serializeNutritionPlan>> = {};
  for (const cat of cats) {
    let plan = await getCurrentNutritionPlan(cat.id);
    if (!plan) continue;
    plans[cat.id] = serializeNutritionPlan(
      plan,
      schedules.map((row) => ({
        id: row.id,
        label: row.label,
        time: row.time,
        sortOrder: row.sortOrder,
      }))
    );
  }

  res.json({
    profile: user ? serializeProfile(user, profile) : null,
    cats: cats.map(serializeCat),
    feedingLogs: feedingLogs.map(serializeFeedingLog),
    weightRecords: weightLogs.map(serializeWeightLog),
    activeCatId: profile?.activeCatId ?? null,
    remindersEnabled: settings?.remindersEnabled ?? true,
    notificationSettings: settings
      ? serializeNotificationSettings(settings)
      : {
          remindersEnabled: true,
          notifyBeforeMinutes: 15,
          pushEnabled: true,
        },
    feedingSchedule: schedules.map((row) => ({
      id: row.id,
      label: row.label,
      time: row.time,
    })),
    foodBrands,
    plans,
  });
});
