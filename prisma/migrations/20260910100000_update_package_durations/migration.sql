UPDATE "packages"
SET "days" = CASE "name"
    WHEN '1 Mes' THEN 31
    WHEN '3 Meses' THEN 93
    WHEN '6 Meses' THEN 186
    WHEN '12 Meses' THEN 372
    ELSE "days"
  END,
  "updated_at" = CURRENT_TIMESTAMP
WHERE "name" IN ('1 Mes', '3 Meses', '6 Meses', '12 Meses');