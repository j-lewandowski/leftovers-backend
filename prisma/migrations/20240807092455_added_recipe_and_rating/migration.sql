/*
  Warnings:

  - The primary key for the `SignUpRequests` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `SignUpRequests` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - Added the required column `email` to the `SignUpRequests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `SignUpRequests` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "PreparationTime" AS ENUM ('UP_TO_15_MIN', 'UP_TO_30_MIN', 'UP_TO_60_MIN', 'OVER_60_MIN');

-- AlterTable
ALTER TABLE "SignUpRequests" DROP CONSTRAINT "SignUpRequests_pkey",
DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD CONSTRAINT "SignUpRequests_pkey" PRIMARY KEY ("email");

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT 'Description',
    "preparation_time" "PreparationTime" NOT NULL DEFAULT 'UP_TO_15_MIN',
    "ingredients" TEXT[],
    "preparation_method" TEXT[],
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author_id" TEXT NOT NULL,
    "category_name" TEXT NOT NULL DEFAULT 'breakfast',

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("name")
);

INSERT INTO "Category" (name) VALUES ('breakfast'), ('soups'), ('lunch'), ('baking'), ('desserts'), ('drinks'), ('snacks'), ('salads');

-- CreateTable
CREATE TABLE "Rating" (
    "id" SERIAL NOT NULL,
    "value" INTEGER NOT NULL,
    "recipe_id" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_category_name_fkey" FOREIGN KEY ("category_name") REFERENCES "Category"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "Recipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
