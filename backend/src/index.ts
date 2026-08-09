import "dotenv/config";
import cors from "cors";
import express from "express";
import { validateEnv } from "./lib/env.js";
import { ensureFoodBrandsSeeded } from "./lib/foodBrands.js";
import { databaseErrorHint, pingDatabase } from "./lib/prisma.js";
import { authRouter } from "./routes/auth.js";
import { catsRouter } from "./routes/cats.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { feedingSchedulesRouter } from "./routes/feedingSchedules.js";
import { foodBrandsRouter } from "./routes/foodBrands.js";
import { meRouter } from "./routes/me.js";
import { notificationSettingsRouter } from "./routes/notificationSettings.js";
import { profileRouter } from "./routes/profile.js";
import { settingsRouter } from "./routes/settings.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? "0.0.0.0";

if (process.env.NODE_ENV === "production") {
  validateEnv();
}

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "*",
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "catcal-api" });
});

app.get("/health/db", async (_req, res) => {
  try {
    await pingDatabase(3);
    res.json({ ok: true, database: "connected" });
  } catch (error) {
    console.error("Health DB check failed:", error);
    res.status(503).json({
      ok: false,
      database: "unreachable",
      error: databaseErrorHint(error),
    });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/feeding-schedules", feedingSchedulesRouter);
app.use("/api/notification-settings", notificationSettingsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/food-brands", foodBrandsRouter);
app.use("/api/cats", catsRouter);
app.use("/api/me", meRouter);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
);

app.listen(port, host, async () => {
  try {
    await pingDatabase(3);
    console.log("Database connected (Supabase Postgres)");
  } catch (error) {
    console.error("Database unreachable on startup:", error);
    console.error(databaseErrorHint(error));
  }

  try {
    await ensureFoodBrandsSeeded();
  } catch (err) {
    console.warn("FoodBrand seed skipped:", err);
  }
  console.log(`CatCal API running on http://${host}:${port}`);
});
