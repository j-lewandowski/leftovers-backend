-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Category" ("id", "name") VALUES ('1', 'Breakfast');
INSERT INTO "Category" ("id", "name") VALUES ('2', 'Soups');
INSERT INTO "Category" ("id", "name") VALUES ('3', 'Lunch');
INSERT INTO "Category" ("id", "name") VALUES ('4', 'Baking');
INSERT INTO "Category" ("id", "name") VALUES ('5', 'Desserts');
INSERT INTO "Category" ("id", "name") VALUES ('6', 'Drinks');
INSERT INTO "Category" ("id", "name") VALUES ('7', 'Snacks');
INSERT INTO "Category" ("id", "name") VALUES ('8', 'Salads');
