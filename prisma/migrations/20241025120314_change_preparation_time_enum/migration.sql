/*
  Warnings:

  - The values [UP_TO_15_MIN,UP_TO_30_MIN,UP_TO_60_MIN,OVER_60_MIN] on the enum `PreparationTime` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PreparationTime_new" AS ENUM ('UpTo15Min', 'UpTo30Min', 'UpTo60Min', 'Over60Min');
ALTER TABLE "Recipe" ALTER COLUMN "preparation_time" DROP DEFAULT;
ALTER TABLE "Recipe" ALTER COLUMN "preparation_time" TYPE "PreparationTime_new" USING ("preparation_time"::text::"PreparationTime_new");
ALTER TYPE "PreparationTime" RENAME TO "PreparationTime_old";
ALTER TYPE "PreparationTime_new" RENAME TO "PreparationTime";
DROP TYPE "PreparationTime_old";
ALTER TABLE "Recipe" ALTER COLUMN "preparation_time" SET DEFAULT 'UpTo15Min';
COMMIT;

-- AlterTable
ALTER TABLE "Recipe" ALTER COLUMN "preparation_time" SET DEFAULT 'UpTo15Min';
