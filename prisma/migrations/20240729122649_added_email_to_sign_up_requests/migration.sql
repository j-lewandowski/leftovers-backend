/*
  Warnings:

  - Added the required column `email` to the `SignUpRequests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SignUpRequests" ADD COLUMN     "email" TEXT NOT NULL;
