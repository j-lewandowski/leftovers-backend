import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { CreatedRecipeDto } from './dto/created-recipe-dto';
import { GetRecepiesFiltersDto } from './dto/get-recepies-filter.dto';
import { RecipeDto } from './dto/recipe.dto';

@Injectable()
export class RecipesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(userId: string = null, params: GetRecepiesFiltersDto = {}) {
    return this.prisma.client.recipe.getAllRecipes({
      userId,
      ...params,
    });
  }

  async getOne(recipeId: string): Promise<RecipeDto> {
    return this.prisma.client.recipe.getSingleRecipe(recipeId);
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
        image: createRecipeDto.image,
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
