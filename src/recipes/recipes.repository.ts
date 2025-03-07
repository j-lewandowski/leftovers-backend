import { Injectable } from '@nestjs/common';
import { Rating, Recipe, Visibility } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { GetRecipesFiltersDto } from './dto/get-recipes-filter.dto';
import { QueryRecipeDto } from './dto/query-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Injectable()
export class RecipesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(
    userId: string = null,
    params: GetRecipesFiltersDto,
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

  async update(
    recipeId: string,
    updateRecipeDto: UpdateRecipeDto,
  ): Promise<Recipe> {
    return this.prisma.recipe.update({
      where: {
        id: recipeId,
      },
      data: {
        title: updateRecipeDto?.title,
        description: updateRecipeDto?.description,
        preparationSteps: updateRecipeDto?.preparationSteps,
        servings: updateRecipeDto?.servings,
        ingredients: updateRecipeDto?.ingredients,
        visibility: updateRecipeDto?.visibility,
        imageKey: updateRecipeDto?.imageKey,
        category: updateRecipeDto?.categoryName && {
          connect: {
            name: updateRecipeDto?.categoryName,
          },
        },
      },
    });
  }

  async remove(recipeId: string): Promise<void> {
    await this.prisma.recipe.delete({
      where: {
        id: recipeId,
      },
    });
  }

  async getAllPublicRecipeIds(): Promise<{ id: string }[]> {
    return this.prisma.recipe.findMany({
      select: { id: true },
      where: { visibility: Visibility.PUBLIC },
    });
  }

  async totalRecipes(userId: string): Promise<number> {
    return this.prisma.recipe.count({
      where: {
        visibility: userId
          ? { in: [Visibility.PRIVATE, Visibility.PUBLIC] }
          : Visibility.PUBLIC,
      },
    });
  }

  async getRecipeOfTheDay(): Promise<{ recipeId: string } | null> {
    return this.prisma.recipeOfTheDay.findFirst({});
  }

  async refreshRecipeOfTheDay(recipeId: string): Promise<void> {
    await this.prisma.recipeOfTheDay.updateMany({
      data: {
        recipeId,
      },
    });
  }

  async addRecipeOfTheDay(recipeId: string): Promise<void> {
    await this.prisma.recipeOfTheDay.create({
      data: {
        recipeId,
      },
    });
  }

  findRating(recipeId: string, userId: string): Promise<Rating | null> {
    return this.prisma.rating.findFirst({
      where: {
        recipeId: recipeId,
        userId: userId,
      },
    });
  }

  async rateRecipe(
    recipeId: string,
    userId: string,
    value: number,
  ): Promise<void> {
    await this.prisma.rating.create({
      data: {
        recipeId,
        userId,
        value,
      },
    });
  }
}
