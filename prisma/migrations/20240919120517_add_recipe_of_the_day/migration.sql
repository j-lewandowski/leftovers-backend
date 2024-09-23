-- CreateTable
CREATE TABLE "RecipeOfTheDay" (
    "recipeId" TEXT NOT NULL,

    CONSTRAINT "RecipeOfTheDay_pkey" PRIMARY KEY ("recipeId")
);

-- AddForeignKey
ALTER TABLE "RecipeOfTheDay" ADD CONSTRAINT "RecipeOfTheDay_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
