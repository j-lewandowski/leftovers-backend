import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipesGuard } from './recipes.guard';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}
  @UseGuards(RecipesGuard)
  @Get()
  findAll(@Request() request) {
    return this.recipesService.findAll(request.user?.userId);
  }
}
