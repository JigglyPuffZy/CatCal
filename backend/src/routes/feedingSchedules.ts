import { Router } from "express";
import { z } from "zod";
import { isValidMealTime } from "../lib/feedingSchedule.js";
import { prisma } from "../lib/prisma.js";
import { serializeFeedingSchedule } from "../lib/serialize.js";
import { authenticate, type AuthedRequest } from "../middleware/authenticate.js";

export const feedingSchedulesRouter = Router();

feedingSchedulesRouter.use(authenticate);

const createSchema = z.object({
  label: z.string().min(1).max(80),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  sortOrder: z.number().int().min(0).optional(),
});

const updateSchema = createSchema.partial();

feedingSchedulesRouter.get("/", async (req: AuthedRequest, res) => {
  const rows = await prisma.feedingSchedule.findMany({
    where: { userId: req.user!.userId },
    orderBy: { sortOrder: "asc" },
  });
  res.json({ schedules: rows.map(serializeFeedingSchedule) });
});

feedingSchedulesRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!isValidMealTime(parsed.data.time)) {
    res.status(400).json({ error: "Invalid feeding schedule time." });
    return;
  }

  const count = await prisma.feedingSchedule.count({
    where: { userId: req.user!.userId },
  });

  const row = await prisma.feedingSchedule.create({
    data: {
      userId: req.user!.userId,
      label: parsed.data.label,
      time: parsed.data.time,
      sortOrder: parsed.data.sortOrder ?? count,
    },
  });

  res.status(201).json({ schedule: serializeFeedingSchedule(row) });
});

feedingSchedulesRouter.patch("/:id", async (req: AuthedRequest, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await prisma.feedingSchedule.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  });
  if (!existing) {
    res.status(404).json({ error: "Feeding schedule not found" });
    return;
  }

  const row = await prisma.feedingSchedule.update({
    where: { id: existing.id },
    data: parsed.data,
  });

  res.json({ schedule: serializeFeedingSchedule(row) });
});

feedingSchedulesRouter.delete("/:id", async (req: AuthedRequest, res) => {
  const existing = await prisma.feedingSchedule.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  });
  if (!existing) {
    res.status(404).json({ error: "Feeding schedule not found" });
    return;
  }

  await prisma.feedingSchedule.delete({ where: { id: existing.id } });
  res.status(204).send();
});
