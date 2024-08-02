import { Injectable } from '@nestjs/common';
import { RecipesRepository } from './recipes.repository';

@Injectable()
export class RecipesService {
  constructor(private recipesRepository: RecipesRepository) {}

  findAll(userId?: string) {
    return this.recipesRepository.getAll(userId);
  }
}
