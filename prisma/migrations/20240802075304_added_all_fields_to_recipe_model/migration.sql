-- CreateEnum
CREATE TYPE "PreparationTime" AS ENUM ('UP_TO_15_MIN', 'UP_TO_30_MIN', 'UP_TO_60_MIN', 'OVER_60_MIN');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "recipeId" TEXT;

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL DEFAULT 'Description',
ADD COLUMN     "ingredients" TEXT[],
ADD COLUMN     "preparation_method" TEXT[],
ADD COLUMN     "preparation_time" "PreparationTime" NOT NULL DEFAULT 'UP_TO_15_MIN';

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;
