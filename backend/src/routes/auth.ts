import { Router } from "express";
import { z } from "zod";
import { hashPassword, signToken, verifyPassword } from "../lib/auth.js";
import { databaseErrorMessage, isDatabaseUnavailable } from "../lib/dbErrors.js";
import { sendPasswordResetCode } from "../lib/email.js";
import {
  clearPasswordResetTokens,
  createPasswordResetCode,
  verifyPasswordResetCode,
} from "../lib/passwordReset.js";
import { prisma } from "../lib/prisma.js";
import { serializeProfile } from "../lib/serialize.js";
import { ensureUserDefaults } from "../lib/userSetup.js";
import { authenticate, type AuthedRequest } from "../middleware/authenticate.js";

export const authRouter = Router();

const registerSchema = z.object({
  fullName: z.string().min(1).max(120),
  email: z.string().email().max(255),
  password: z.string().min(6).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email().max(255),
});

const resetPasswordSchema = z.object({
  email: z.string().email().max(255),
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
  password: z.string().min(6).max(128),
});

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check your name, email, and password." });
    return;
  }

  const { fullName, email, password } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const existing = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    });
    if (existing) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email: normalizedEmail, passwordHash },
    });

    await ensureUserDefaults(user.id, fullName);

    await prisma.profile.update({
      where: { userId: user.id },
      data: { fullName: fullName.trim() },
    });

    const token = signToken({ userId: user.id, email: user.email });
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });

    res.status(201).json({
      token,
      user: serializeProfile(user, profile),
    });
  } catch (error) {
    console.error("Register failed:", error);
    if (isDatabaseUnavailable(error)) {
      res.status(503).json({ error: databaseErrorMessage() });
      return;
    }
    res.status(500).json({ error: "Could not create account. Please try again." });
  }
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Enter a valid email and password." });
    return;
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    await ensureUserDefaults(user.id);

    const token = signToken({ userId: user.id, email: user.email });
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });

    res.json({
      token,
      user: serializeProfile(user, profile),
    });
  } catch (error) {
    console.error("Login failed:", error);
    if (isDatabaseUnavailable(error)) {
      res.status(503).json({ error: databaseErrorMessage() });
      return;
    }
    res.status(500).json({ error: "Could not sign in. Please try again." });
  }
});

authRouter.post("/logout", authenticate, async (_req: AuthedRequest, res) => {
  res.status(204).send();
});

authRouter.post("/forgot-password", async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Enter a valid email address." });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  const genericMessage =
    "If that email is registered, we sent a 6-digit reset code.";

  try {
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });
    if (!user) {
      res.json({ message: genericMessage });
      return;
    }

    const code = await createPasswordResetCode(user.id);
    const emailSent = await sendPasswordResetCode(user.email, code);

    const payload: { message: string; devResetCode?: string } = {
      message: genericMessage,
    };

    if (!emailSent && process.env.NODE_ENV !== "production") {
      payload.devResetCode = code;
      console.info(`[dev] Password reset code for ${email}: ${code}`);
    }

    res.json(payload);
  } catch (error) {
    console.error("Forgot password failed:", error);
    if (isDatabaseUnavailable(error)) {
      res.status(503).json({ error: databaseErrorMessage() });
      return;
    }
    res.status(500).json({ error: "Could not start password reset. Try again." });
  }
});

authRouter.post("/reset-password", async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Check your email, 6-digit code, and new password (min 6 characters).",
    });
    return;
  }

  const { email, code, password } = parsed.data;

  try {
    const verified = await verifyPasswordResetCode(email.trim().toLowerCase(), code);
    if (!verified) {
      res.status(400).json({ error: "Invalid or expired reset code." });
      return;
    }

    const passwordHash = await hashPassword(password);
    await prisma.user.update({
      where: { id: verified.userId },
      data: { passwordHash },
    });
    await clearPasswordResetTokens(verified.userId);

    res.json({ message: "Password updated. You can sign in now." });
  } catch (error) {
    console.error("Reset password failed:", error);
    if (isDatabaseUnavailable(error)) {
      res.status(503).json({ error: databaseErrorMessage() });
      return;
    }
    res.status(500).json({ error: "Could not reset password. Try again." });
  }
});

authRouter.get("/me", authenticate, async (req: AuthedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { profile: true },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ profile: serializeProfile(user, user.profile) });
  } catch (error) {
    console.error("Me failed:", error);
    if (isDatabaseUnavailable(error)) {
      res.status(503).json({ error: databaseErrorMessage() });
      return;
    }
    res.status(500).json({ error: "Could not load profile." });
  }
});
