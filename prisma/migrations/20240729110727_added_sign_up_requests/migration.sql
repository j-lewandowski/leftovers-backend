-- CreateTable
CREATE TABLE "SignUpRequests" (
    "validation_token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignUpRequests_pkey" PRIMARY KEY ("validation_token")
);
