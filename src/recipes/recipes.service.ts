import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UploadFileService } from 'src/upload-file/upload-file.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { GetRecepiesFiltersDto } from './dto/get-recepies-filter.dto';
import { RecipeDto } from './dto/recipe.dto';
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
  ): Promise<RecipeDto[]> {
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

  async findOne(recipeId: string, userId: string = null): Promise<RecipeDto> {
    const recipe = await this.recipesRepository.getOne(recipeId);
    console.log(recipe);

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
  ): Promise<void> {
    this.recipesRepository.create(createRecipeDto, userId);
  }
}
