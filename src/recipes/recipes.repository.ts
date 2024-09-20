import { Injectable } from '@nestjs/common';
import { Recipe } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { GetRecepiesFiltersDto } from './dto/get-recepies-filter.dto';
import { QueryRecipeDto } from './dto/query-recipe.dto';

@Injectable()
export class RecipesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(
    userId: string = null,
    params: GetRecepiesFiltersDto = {},
  ): Promise<QueryRecipeDto[]> {
    return this.prisma.client.recipe.getAllRecipes({
      userId,
      ...params,
    });
  }

  async getOne(recipeId: string): Promise<QueryRecipeDto> {
    return this.prisma.client.recipe.getSingleRecipe(recipeId);
  }

  async create(
    createRecipeDto: CreateRecipeDto,
    userId: string,
  ): Promise<Recipe> {
    return this.prisma.recipe.create({
      data: {
        title: createRecipeDto.title,
        description: createRecipeDto.description,
        preparationSteps: createRecipeDto.preparationSteps,
        servings: createRecipeDto.servings,
        ingredients: createRecipeDto.ingredients,
        visibility: createRecipeDto.visibility,
        imageKey: createRecipeDto.imageKey,
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
