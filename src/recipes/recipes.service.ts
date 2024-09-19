import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { CreatedRecipeDto } from './dto/created-recipe-dto';
import { GetRecepiesFiltersDto } from './dto/get-recepies-filter.dto';
import { RecipeDto } from './dto/recipe.dto';
import { RecipesRepository } from './recipes.repository';

@Injectable()
export class RecipesService {
  constructor(private readonly recipesRepository: RecipesRepository) {}

  findAll(userId?: string, params?: GetRecepiesFiltersDto) {
    return this.recipesRepository.getAll(userId, params);
  }

  async findOne(recipeId: string, userId: string = null): Promise<RecipeDto> {
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

    return recipe;
  }

  async create(
    createRecipeDto: CreateRecipeDto,
    userId: string,
  ): Promise<CreatedRecipeDto> {
    return this.recipesRepository.create(createRecipeDto, userId);
  }
}
