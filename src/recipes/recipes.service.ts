import { Injectable } from '@nestjs/common';
import { RecipesRepository } from './recipes.repository';
import { GetRecepiesFiltersDto } from './dto/get-recepies-filter.dto';

@Injectable()
export class RecipesService {
  constructor(private recipesRepository: RecipesRepository) {}

  findAll(userId?: string, params?: GetRecepiesFiltersDto) {
    return this.recipesRepository.getAll(userId, params);
  }
}
