-- CreateTable
CREATE TABLE "SavedRecipe" (
    "recipe_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "SavedRecipe_pkey" PRIMARY KEY ("user_id","recipe_id")
);

-- AddForeignKey
ALTER TABLE "SavedRecipe" ADD CONSTRAINT "SavedRecipe_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedRecipe" ADD CONSTRAINT "SavedRecipe_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
