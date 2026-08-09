# Cat Food Catalog — Scaling to 10,000+ Verified Products

## What exists today

- **`backend/sql/supabase_06_cat_food_catalog.sql`** — schema + **11 verified SKUs** (Phase 1)
- Every row has an official `source_url` (manufacturer site or PDF)
- `calculation_method = 'Official'` only when ME is printed on the label/page
- **`confidence_score`** — 100 = full GA + ME from PDF; 95 = ME from official shop page only

## What Phase 1 does NOT claim

- 10,000+ products (that requires months of verified ingestion)
- Whiskas, Hill's, Blue Buffalo, etc. at SKU level (placeholders remain in `FoodBrand` until verified)

## How to add verified products

1. Find **official** ME on manufacturer site or product PDF (not blogs).
2. Add a row to `supabase_06_cat_food_catalog.sql` or a new `supabase_06_seed_<brand>.sql`.
3. Set:
   - `calculation_method = 'Official'` if ME is on the label
   - `calculation_method = 'Estimated'` **only** if you used NRC/FEDIAF from guaranteed analysis (document formula in PR)
4. Run in Supabase SQL Editor.
5. Optionally link `FoodBrand.catalogProductId` to the catalog row.

## NRC metabolizable energy (when label has GA but no ME)

Use only when no official calorie statement exists:

```
ME (kcal/kg) ≈ 10 × (3.5×CP + 8.5×CF + 3.5×NFE)
```

Where CP, CF, NFE are % dry matter. Mark `calculation_method = 'Estimated'` and `confidence_score ≤ 70`.

## Recommended pipeline for 10k+ SKUs

| Stage | Tool | Source priority |
|-------|------|-----------------|
| 1 | Manual seed | Official PDFs per brand (Purina, Mars, Hill's, Colgate-Palmolive) |
| 2 | Scripted fetch | Manufacturer product label PDF URLs (Purina publishes many) |
| 3 | Human QA | Spot-check 5% of rows against packaging |
| 4 | API | `GET /api/cat-food-products?brand=&q=` reading `CatFoodProduct` |

## Brands with good official PDF coverage

- **Purina / Fancy Feast / Pro Plan / ONE** — `purina.com/sites/default/files/...pdf`
- **Royal Canin** — product pages list ME + GA
- **Hill's** — `hillspet.com` product pages + vet feeding PDFs (match exact formula name)

## Brands requiring regional label checks

Whiskas, Sheba, Me-O, SmartHeart, Kit Cat — formulations differ by country. Store `country` on every row; never copy US ME to PH SKU without verification.
