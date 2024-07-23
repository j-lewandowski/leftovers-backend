-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

INSERT INTO "User"(email, name) VALUES ('test1@email.com', 'testname1');
INSERT INTO "User"(email, name) VALUES ('test2@email.com', 'testname2');
INSERT INTO "User"(email, name) VALUES ('test3@email.com', 'testname3');

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");


