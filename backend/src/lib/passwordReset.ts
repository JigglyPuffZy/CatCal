import crypto from "crypto";
import { hashPassword, verifyPassword } from "./auth.js";
import { prisma } from "./prisma.js";

const RESET_TTL_MS = 15 * 60 * 1000;

export function generateResetCode(): string {
  return String(crypto.randomInt(100000, 999999));
}

export async function createPasswordResetCode(userId: string): Promise<string> {
  const code = generateResetCode();
  const codeHash = await hashPassword(code);
  const expiresAt = new Date(Date.now() + RESET_TTL_MS);

  await prisma.passwordResetToken.deleteMany({ where: { userId } });
  await prisma.passwordResetToken.create({
    data: { userId, codeHash, expiresAt },
  });

  return code;
}

export async function verifyPasswordResetCode(
  email: string,
  code: string
): Promise<{ userId: string } | null> {
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  if (!user) return null;

  const token = await prisma.passwordResetToken.findFirst({
    where: {
      userId: user.id,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!token || !(await verifyPassword(code, token.codeHash))) {
    return null;
  }

  return { userId: user.id };
}

export async function clearPasswordResetTokens(userId: string): Promise<void> {
  await prisma.passwordResetToken.deleteMany({ where: { userId } });
}
