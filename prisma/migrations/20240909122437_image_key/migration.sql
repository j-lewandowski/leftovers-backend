/*
  Warnings:

  - You are about to drop the column `image` on the `Recipe` table. All the data in the column will be lost.
  - Added the required column `image_key` to the `Recipe` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "image",
ADD COLUMN     "image_key" TEXT NOT NULL;
