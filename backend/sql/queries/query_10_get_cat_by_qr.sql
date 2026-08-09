-- ============================================================
-- CatCal Query 10 — Get Cat By QR Code Query
-- API: GET /api/cats/resolve-qr?payload=catcal://cat/CAT_ID
-- Replace: CAT_ID, USER_ID
-- Note: API parses the payload and looks up by cat id + userId (not qrCode column alone).

SELECT *
FROM "Cat"
WHERE id = 'CAT_ID'
  AND "userId" = 'USER_ID';

-- Alternate: lookup by stored qrCode value (same result for standard QR format)
-- SELECT * FROM "Cat" WHERE "qrCode" = 'catcal://cat/CAT_ID' AND "userId" = 'USER_ID';
