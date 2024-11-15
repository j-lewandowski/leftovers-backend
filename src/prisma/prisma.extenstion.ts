import { PrismaClient } from '@prisma/client';
import { GetRecipesFiltersDto } from 'src/recipes/dto/get-recipes-filter.dto';
import { QueryRecipeDto } from 'src/recipes/dto/query-recipe.dto';

export const customPrismaClient = (prismaClient: PrismaClient) => {
  return prismaClient.$extends({
    model: {
      recipe: {
        async getAllRecipes(
          params: GetRecipesFiltersDto,
        ): Promise<QueryRecipeDto[]> {
          let query = `SELECT ${
            params.details
              ? '*'
              : 'id, title, description, rating, "numberOfRatings", "imageKey", "isSaved", visibility'
          } FROM recipe_view as v WHERE `;

          const dbQueryParams = [];
          if (params.userId) {
            query += `(visibility = 'PUBLIC' OR (visibility = 'PRIVATE' AND v."authorId" = $1)) `;
            dbQueryParams.push(params.userId);
          } else {
            query += `visibility = 'PUBLIC' `;
          }

          if (params.category) {
            query += `AND "categoryName" IN (${params.category
              .map((_, idx) => `$${dbQueryParams.length + idx + 1}`)
              .join(', ')}) `;
            dbQueryParams.push(...params.category);
          }

          if (params.rating) {
            query += `AND v.rating >= $${dbQueryParams.length + 1} `;
            dbQueryParams.push(params.rating);
          }

          if (params.startDate || params.endDate) {
            if (params.startDate) {
              query += `AND v."createdAt" >= $${
                dbQueryParams.length + 1
              }::timestamp `;
              dbQueryParams.push(params.startDate.toISOString());
            }

            if (params.endDate) {
              query += `AND v."createdAt" <= $${
                dbQueryParams.length + 1
              }::timestamp `;
              dbQueryParams.push(params.endDate.toISOString());
            }
          }

          if (params.title) {
            const searchTerm = `%${params.title}%`;
            query += `AND v.title ILIKE $${dbQueryParams.length + 1} `;
            dbQueryParams.push(searchTerm);
          }

          if (params.description) {
            const searchTerm = `%${params.description}%`;
            query += `AND v.description ILIKE $${dbQueryParams.length + 1} `;
            dbQueryParams.push(searchTerm);
          }

          if (params.ingredients) {
            const searchTerm = `%${params.ingredients}%`;
            query += `AND array_to_string(v.ingredients, ',') ILIKE $${
              dbQueryParams.length + 1
            } `;
            dbQueryParams.push(searchTerm);
          }

          if (params.steps) {
            const searchTerm = `%${params.steps}%`;
            query += `AND array_to_string(v."preparationMethod", ',') ILIKE $${
              dbQueryParams.length + 1
            } `;
            dbQueryParams.push(searchTerm);
          }

          if (!!params.saved) {
            query += `AND v."isSaved" = $${dbQueryParams.length + 1} `;
            dbQueryParams.push(params.saved);
          }

          if (params.myRecipes) {
            query += `AND v."authorId" = $${dbQueryParams.length + 1} `;
            dbQueryParams.push(params.userId);
          }

          query += 'ORDER BY ';
          if (params.sort) {
            const orderClauses = params.sort
              .map(
                ({ field, direction }) =>
                  `v."${field}" ${direction.toUpperCase()}`,
              )
              .join(', ');
            query += orderClauses + ' ';
          } else {
            query += `v.rating DESC, v."createdAt" DESC `;
          }

          query += `LIMIT $${dbQueryParams.length + 1} OFFSET $${
            dbQueryParams.length + 2
          }`;

          if (params.limit) {
            dbQueryParams.push(params.limit);
          }

          if (params.page) {
            dbQueryParams.push((params.page - 1) * params.limit);
          }

          return prismaClient.$queryRawUnsafe<QueryRecipeDto[]>(
            query,
            ...dbQueryParams,
          );
        },

        async getSingleRecipe(id: string): Promise<QueryRecipeDto> {
          const recipeList =
            await prismaClient.$queryRaw<QueryRecipeDto>`SELECT * FROM recipe_view WHERE id=${id} LIMIT 1`;

          return recipeList[0];
        },
      },
    },
  });
};

export class PrismaClientExtended extends PrismaClient {
  private customPrismaClient: CustomPrismaClient;

  get client() {
    if (!this.customPrismaClient) {
      this.customPrismaClient = customPrismaClient(this);
    }
    return this.customPrismaClient;
  }
}

export type CustomPrismaClient = ReturnType<typeof customPrismaClient>;
