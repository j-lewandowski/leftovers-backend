/*
  Warnings:

  - You are about to drop the column `preparation_method` on the `Recipe` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "preparation_method",
ADD COLUMN     "preparation_steps" TEXT[];
