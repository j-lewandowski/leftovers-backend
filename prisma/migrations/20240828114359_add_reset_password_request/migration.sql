-- CreateTable
CREATE TABLE "ResetPasswordRequest" (
    "validation_token" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "ResetPasswordRequest_pkey" PRIMARY KEY ("validation_token")
);
