/*
  Warnings:

  - The primary key for the `SignUpRequests` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "SignUpRequests" DROP CONSTRAINT "SignUpRequests_pkey",
ADD CONSTRAINT "SignUpRequests_pkey" PRIMARY KEY ("email");
