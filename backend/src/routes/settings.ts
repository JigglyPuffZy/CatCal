import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate, type AuthedRequest } from "../middleware/authenticate.js";

export const settingsRouter = Router();

settingsRouter.use(authenticate);

const settingsSchema = z.object({
  activeCatId: z.string().nullable().optional(),
});

settingsRouter.get("/", async (req: AuthedRequest, res) => {
  const profile = await prisma.profile.findUnique({
    where: { userId: req.user!.userId },
  });
  res.json({ activeCatId: profile?.activeCatId ?? null });
});

settingsRouter.patch("/", async (req: AuthedRequest, res) => {
  const parsed = settingsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  if (parsed.data.activeCatId) {
    const cat = await prisma.cat.findFirst({
      where: { id: parsed.data.activeCatId, userId: req.user!.userId },
    });
    if (!cat) {
      res.status(400).json({ error: "Active cat not found" });
      return;
    }
  }

  const profile = await prisma.profile.upsert({
    where: { userId: req.user!.userId },
    create: {
      userId: req.user!.userId,
      fullName: "CatCal User",
      activeCatId: parsed.data.activeCatId ?? null,
    },
    update: {
      ...(parsed.data.activeCatId !== undefined
        ? { activeCatId: parsed.data.activeCatId }
        : {}),
    },
  });

  res.json({ activeCatId: profile.activeCatId });
});
