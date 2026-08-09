import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import {
  getCurrentNutritionPlan,
  getTodayFeedingStatus,
} from "../lib/nutrition.js";
import {
  serializeCat,
  serializeFeedingLog,
  serializeNutritionPlan,
  serializeWeightLog,
} from "../lib/serialize.js";
import { getUserFeedingSchedules } from "../lib/userSetup.js";
import { authenticate, type AuthedRequest } from "../middleware/authenticate.js";

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

dashboardRouter.get("/summary", async (req: AuthedRequest, res) => {
  const userId = req.user!.userId;
  const [profile, cats, schedules] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.cat.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    getUserFeedingSchedules(userId),
  ]);

  const activeCat =
    cats.find((cat) => cat.id === profile?.activeCatId) ?? cats[0] ?? null;

  if (!activeCat) {
    res.json({
      activeCat: null,
      plan: null,
      todayStatus: null,
      catCount: 0,
    });
    return;
  }

  const [plan, todayLogs] = await Promise.all([
    getCurrentNutritionPlan(activeCat.id),
    prisma.feedingLog.findMany({
      where: { catId: activeCat.id, fedAt: { gte: startOfToday() } },
      orderBy: { fedAt: "desc" },
    }),
  ]);

  const status = await getTodayFeedingStatus(
    activeCat,
    todayLogs,
    schedules,
    plan ?? undefined
  );

  res.json({
    activeCat: serializeCat(activeCat),
    catCount: cats.length,
    plan: plan
      ? serializeNutritionPlan(plan, schedules.map((row) => ({
          id: row.id,
          label: row.label,
          time: row.time,
          sortOrder: row.sortOrder,
        })))
      : null,
    todayStatus: {
      mealsDone: status.mealsDone,
      mealsTotal: status.mealsTotal,
      kcalLeft: status.kcalLeft,
      nextMealLabel: status.nextMealLabel,
      nextMealTime: status.nextMealTime,
    },
  });
});

dashboardRouter.get("/recent-activity", async (req: AuthedRequest, res) => {
  const userId = req.user!.userId;
  const limit = Math.min(Number(req.query.limit) || 20, 50);

  const [feedingLogs, weightLogs] = await Promise.all([
    prisma.feedingLog.findMany({
      where: { cat: { userId } },
      orderBy: { fedAt: "desc" },
      take: limit,
    }),
    prisma.weightLog.findMany({
      where: { cat: { userId } },
      orderBy: { recordedAt: "desc" },
      take: limit,
    }),
  ]);

  const activity = [
    ...feedingLogs.map((log) => ({
      type: "feeding" as const,
      at: log.fedAt.toISOString(),
      data: serializeFeedingLog(log),
    })),
    ...weightLogs.map((log) => ({
      type: "weight" as const,
      at: log.recordedAt.toISOString(),
      data: serializeWeightLog(log),
    })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, limit);

  res.json({ activity });
});
