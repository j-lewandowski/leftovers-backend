/*
  Warnings:

  - Added the required column `password` to the `SignUpRequests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SignUpRequests" ADD COLUMN     "password" TEXT NOT NULL;
