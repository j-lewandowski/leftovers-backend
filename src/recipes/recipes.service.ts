import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Recipe } from '@prisma/client';
import { UploadFileService } from '../upload-file/upload-file.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { GetRecipesFiltersDto } from './dto/get-recipes-filter.dto';
import { OutputRecipeDto } from './dto/output-recipe.dto';
import { PaginatedRecipesDto } from './dto/paginated-recipes.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipesRepository } from './recipes.repository';

@Injectable()
export class RecipesService {
  constructor(
    private readonly recipesRepository: RecipesRepository,
    private readonly uploadFileService: UploadFileService,
  ) {}

  async findAll(
    userId?: string,
    queryParams?: GetRecipesFiltersDto,
  ): Promise<PaginatedRecipesDto> {
    const recipes = await this.recipesRepository.getAll(userId, queryParams);
    const totalRecipes = await this.recipesRepository.totalRecipes(userId);

    return {
      recipes: await Promise.all(
        recipes.map(async (recipe) => {
          const { imageKey, ...otherFields } = recipe;
          return {
            ...otherFields,
            imageUrl: await this.uploadFileService.getImageUrl(imageKey),
          };
        }),
      ),
      page: queryParams.page || 1,
      limit: queryParams.limit || 50,
      totalRecipes,
    };
  }

  async findOne(
    recipeId: string,
    userId: string = null,
  ): Promise<OutputRecipeDto> {
    const recipe = await this.recipesRepository.getOne(recipeId);

    if (!recipe) {
      throw new NotFoundException();
    }
    if (
      (!userId && recipe.visibility === 'PRIVATE') ||
      (recipe.visibility === 'PRIVATE' && userId !== recipe.authorId)
    ) {
      throw new ForbiddenException();
    }

    const { imageKey, ...otherFields } = recipe;

    return {
      ...otherFields,
      imageUrl: await this.uploadFileService.getImageUrl(imageKey),
    };
  }

  async create(
    createRecipeDto: CreateRecipeDto,
    userId: string,
  ): Promise<Recipe> {
    return this.recipesRepository.create(createRecipeDto, userId);
  }

  async update(
    recipeId: string,
    updateRecipeDto: UpdateRecipeDto,
    userId: string,
  ): Promise<Recipe> {
    const recipe = await this.recipesRepository.getOne(recipeId);

    if (!recipe) {
      throw new NotFoundException();
    }

    if (recipe?.imageKey !== updateRecipeDto.imageKey) {
      await this.uploadFileService.deleteImage(recipe.imageKey);
    }

    if (recipe.authorId !== userId) {
      throw new ForbiddenException();
    }

    return this.recipesRepository.update(recipeId, updateRecipeDto);
  }
  async remove(recipeId: string, userId: string): Promise<void> {
    const recipe = await this.recipesRepository.getOne(recipeId);

    if (!recipe) {
      throw new NotFoundException();
    }

    if (recipe.authorId !== userId) {
      throw new ForbiddenException();
    }

    await Promise.allSettled([
      this.uploadFileService.deleteImage(recipe.imageKey),
      this.recipesRepository.remove(recipeId),
    ]);
  }

  async refreshRecipeOfTheDay(): Promise<void> {
    const recipes = await this.recipesRepository.getAllPublicRecipeIds();

    if (!recipes.length) {
      return;
    }
    const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)].id;

    const currentRecipeOfTheDay =
      await this.recipesRepository.getRecipeOfTheDay();

    if (!currentRecipeOfTheDay) {
      await this.recipesRepository.addRecipeOfTheDay(randomRecipe);
      return;
    }

    await this.recipesRepository.refreshRecipeOfTheDay(randomRecipe);
  }

  async getRecipeOfTheDay() {
    const currentRecipeOfTheDay =
      await this.recipesRepository.getRecipeOfTheDay();

    return this.findOne(currentRecipeOfTheDay.recipeId);
  }

  async rateRecipe(
    recipeId: string,
    userId: string,
    value: number,
  ): Promise<void> {
    const rating = await this.recipesRepository.findRating(recipeId, userId);
    if (rating) {
      throw new ConflictException();
    }

    await this.recipesRepository.rateRecipe(recipeId, userId, value);
  }
}
