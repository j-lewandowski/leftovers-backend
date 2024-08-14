import { Injectable } from '@nestjs/common';
import { RecipesRepository } from './recipes.repository';
import { GetRecepiesFiltersDto } from './dto/get-recepies-filter.dto';
import { RecipeDto } from './dto/recipe.dto';

@Injectable()
export class RecipesService {
  constructor(private readonly recipesRepository: RecipesRepository) {}

  findAll(
    userId?: string,
    params?: GetRecepiesFiltersDto,
  ): Promise<RecipeDto[]> {
    return this.recipesRepository.getAll(userId, params);
  }
}
