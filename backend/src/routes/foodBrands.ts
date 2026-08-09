import { Router } from "express";
import { listFoodBrands } from "../lib/foodBrands.js";

export const foodBrandsRouter = Router();

/** Public reference data — no auth required. */
foodBrandsRouter.get("/", async (_req, res) => {
  const brands = await listFoodBrands();
  res.json({ brands });
});
