import { Router } from "express";
import { z } from "zod";
import { hashPassword, verifyPassword } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";
import { serializeProfile } from "../lib/serialize.js";
import { authenticate, type AuthedRequest } from "../middleware/authenticate.js";

export const profileRouter = Router();

profileRouter.use(authenticate);

const updateProfileSchema = z.object({
  fullName: z.string().min(1).max(120).optional(),
  email: z.string().email().max(255).optional(),
  password: z.string().min(6).max(128).optional(),
  currentPassword: z.string().min(1).optional(),
});

profileRouter.get("/", async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { profile: true },
  });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ profile: serializeProfile(user, user.profile) });
});

profileRouter.patch("/", async (req: AuthedRequest, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { profile: true },
  });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  if (parsed.data.password) {
    if (!parsed.data.currentPassword) {
      res.status(400).json({ error: "Current password is required to set a new password." });
      return;
    }
    if (!(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
      res.status(401).json({ error: "Current password is incorrect." });
      return;
    }
  }

  if (parsed.data.email && parsed.data.email !== user.email) {
    const taken = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (taken) {
      res.status(409).json({ error: "Email is already in use." });
      return;
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(parsed.data.email ? { email: parsed.data.email } : {}),
      ...(parsed.data.password
        ? { passwordHash: await hashPassword(parsed.data.password) }
        : {}),
    },
    include: { profile: true },
  });

  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      fullName: parsed.data.fullName ?? "CatCal User",
    },
    update: {
      ...(parsed.data.fullName ? { fullName: parsed.data.fullName } : {}),
    },
  });

  res.json({ profile: serializeProfile(updatedUser, profile) });
});
