import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetRecepiesFiltersDto } from './dto/get-recepies-filter.dto';
import { RecipeDto } from './dto/recipe.dto';
import { Rating, Recipe } from '@prisma/client';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { CreatedRecipeDto } from './dto/created-recipe-dto';

@Injectable()
export class RecipesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(
    userId: string = null,
    params: GetRecepiesFiltersDto = {},
  ): Promise<RecipeDto[]> {
    let query = `
      SELECT 
        ${
          params.details
            ? 'id, title, description, COALESCE("avgRating", 0) as "avgRating", preparation_time as "preparationTime", ingredients, preparation_method as "preparationMethod", visibility, created_at as "createdAt", author_id as "authorId", category_name as "categoryName"'
            : 'id, title, description, COALESCE("avgRating", 0) as "avgRating"'
        }
        
      FROM "Recipe" re
      LEFT JOIN (
        SELECT 
          recipe_id,
          AVG(value) as "avgRating"
        FROM
          "Rating"
        GROUP BY
          recipe_id
      ) as ra ON
        re.id = ra.recipe_id
      WHERE
    `;
    const dbQueryParams = [];
    if (userId) {
      query += `(visibility = 'PUBLIC' OR (visibility = 'PRIVATE' AND re.author_id = $1)) `;
      dbQueryParams.push(userId);
    } else {
      query += `visibility = 'PUBLIC' `;
    }

    if (params.category) {
      query += `AND category_name IN (${params.category
        .map((_, idx) => `$${dbQueryParams.length + idx + 1}`)
        .join(', ')}) `;
      dbQueryParams.push(...params.category);
    }

    if (params.rating) {
      query += `AND ra.avg_rating >= $${dbQueryParams.length + 1} `;
      dbQueryParams.push(params.rating);
    }

    if (params.startDate || params.endDate) {
      if (params.startDate) {
        query += `AND re.created_at >= $${
          dbQueryParams.length + 1
        }::timestamp `;
        dbQueryParams.push(params.startDate.toISOString());
        if (params.endDate) {
          query += `AND re.created_at <= $${
            dbQueryParams.length + 1
          }::timestamp `;
          dbQueryParams.push(params.endDate.toISOString());
        }
      }
    }

    if (params.title) {
      const searchTerm = `%${params.title}%`;
      query += `AND re.title ILIKE $${dbQueryParams.length + 1} `;
      dbQueryParams.push(searchTerm);
    }

    if (params.description) {
      const searchTerm = `%${params.description}%`;
      query += `AND re.description ILIKE $${dbQueryParams.length + 1} `;
      dbQueryParams.push(searchTerm);
    }

    if (params.ingredients) {
      const searchTerm = `%${params.ingredients}%`;
      query += `AND array_to_string(re.ingredients, ',') ILIKE $${
        dbQueryParams.length + 1
      } `;
      dbQueryParams.push(searchTerm);
    }

    if (params.steps) {
      const searchTerm = `%${params.steps}%`;
      query += `AND array_to_string(re.preparation_method, ',') ILIKE $${
        dbQueryParams.length + 1
      } `;
      dbQueryParams.push(searchTerm);
    }
    return this.prisma.$queryRawUnsafe(query, ...dbQueryParams);
  }

  async getOne(recipeId: string): Promise<Recipe & { rating: Rating[] }> {
    const recipe = await this.prisma.recipe.findFirst({
      where: { id: recipeId },
      include: { rating: true },
    });

    return recipe;
  }

  async create(
    createRecipeDto: CreateRecipeDto,
    userId: string,
  ): Promise<CreatedRecipeDto> {
    return this.prisma.recipe.create({
      data: {
        title: createRecipeDto.title,
        description: createRecipeDto.description,
        preparationSteps: createRecipeDto.preparationSteps,
        servings: createRecipeDto.servings,
        ingredients: createRecipeDto.ingredients,
        visibility: createRecipeDto.visibility,
        author: {
          connect: {
            id: userId,
          },
        },
        category: {
          connect: {
            name: createRecipeDto.categoryName,
          },
        },
      },
    });
  }
}
