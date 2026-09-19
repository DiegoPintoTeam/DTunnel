-- CreateTable
CREATE TABLE "packages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- AlterTable
ALTER TABLE "users" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'ADMIN';
ALTER TABLE "users" ADD COLUMN "package_id" INTEGER;
ALTER TABLE "users" ADD COLUMN "expires_at" DATETIME;
