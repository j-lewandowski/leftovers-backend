import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Recipe } from '@prisma/client';
import { UploadFileService } from '../upload-file/upload-file.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { GetRecepiesFiltersDto } from './dto/get-recepies-filter.dto';
import { OutputRecipeDto } from './dto/output-recipe.dto';
import { RecipesRepository } from './recipes.repository';

@Injectable()
export class RecipesService {
  constructor(
    private readonly recipesRepository: RecipesRepository,
    private readonly uploadFileService: UploadFileService,
  ) {}

  async findAll(
    userId?: string,
    params?: GetRecepiesFiltersDto,
  ): Promise<OutputRecipeDto[]> {
    const recipes = await this.recipesRepository.getAll(userId, params);
    return Promise.all(
      recipes.map(async (recipe) => {
        const { imageKey, ...otherFields } = recipe;
        return {
          ...otherFields,
          imageUrl: await this.uploadFileService.getImageUrl(imageKey),
        };
      }),
    );
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
    }

    await this.recipesRepository.refreshRecipeOfTheDay(randomRecipe);
  }

  async getRecipeOfTheDay() {
    const currentRecipeOfTheDay =
      await this.recipesRepository.getRecipeOfTheDay();

    return this.findOne(currentRecipeOfTheDay.recipeId);
  }
}
