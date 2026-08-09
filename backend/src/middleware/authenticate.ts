import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/auth.js";

export type AuthedRequest = Request & {
  user?: { userId: string; email: string };
};

export function authenticate(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  try {
    const token = header.slice(7);
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
