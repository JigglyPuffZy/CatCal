import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { serializeNotificationSettings } from "../lib/serialize.js";
import { authenticate, type AuthedRequest } from "../middleware/authenticate.js";

export const notificationSettingsRouter = Router();

notificationSettingsRouter.use(authenticate);

const patchSchema = z.object({
  remindersEnabled: z.boolean().optional(),
  notifyBeforeMinutes: z.number().int().min(0).max(120).optional(),
  pushEnabled: z.boolean().optional(),
});

notificationSettingsRouter.get("/", async (req: AuthedRequest, res) => {
  const settings = await prisma.notificationSettings.upsert({
    where: { userId: req.user!.userId },
    create: { userId: req.user!.userId },
    update: {},
  });
  res.json({ settings: serializeNotificationSettings(settings) });
});

notificationSettingsRouter.patch("/", async (req: AuthedRequest, res) => {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const settings = await prisma.notificationSettings.upsert({
    where: { userId: req.user!.userId },
    create: {
      userId: req.user!.userId,
      ...parsed.data,
    },
    update: parsed.data,
  });

  res.json({ settings: serializeNotificationSettings(settings) });
});
