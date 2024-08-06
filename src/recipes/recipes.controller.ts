import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipesGuard } from './recipes.guard';
import { GetRecepiesFiltersDto } from './dto/get-recepies-filter.dto';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}
  @UseGuards(RecipesGuard)
  @Get()
  findAll(@Request() request, @Query() params: GetRecepiesFiltersDto) {
    return this.recipesService.findAll(request.user?.userId, params);
  }
}
