import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RecipesRepository } from './recipes.repository';
import { GetRecepiesFiltersDto } from './dto/get-recepies-filter.dto';
import { RecipeDto } from './dto/recipe.dto';
import { calculateAverageRating } from '../../utils/math';

@Injectable()
export class RecipesService {
  constructor(private readonly recipesRepository: RecipesRepository) {}

  findAll(
    userId?: string,
    params?: GetRecepiesFiltersDto,
  ): Promise<RecipeDto[]> {
    return this.recipesRepository.getAll(userId, params);
  }

  async findOne(recipeId: string, userId: string = null): Promise<RecipeDto> {
    const recipe = await this.recipesRepository.getOne(recipeId);

    if (!recipe) {
      throw new NotFoundException();
    }

    if (
      (!userId && recipe.visibility === 'PRIVATE') ||
      (userId !== recipe.authorId && recipe.visibility === 'PRIVATE')
    ) {
      throw new ForbiddenException();
    }

    const { rating, ...otherFields } = recipe;

    return {
      ...otherFields,
      avgRating: calculateAverageRating(rating),
    };
  }
}
