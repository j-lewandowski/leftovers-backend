import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipesGuard } from './recipes.guard';
import { GetRecepiesFiltersDto } from './dto/get-recepies-filter.dto';
import { RecipeDto } from './dto/recipe.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@Controller('recipes')
@ApiTags('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @ApiOperation({
    summary:
      'Allows to get all recipes and filter them. When provided with valid jwt also returns private recipes user has created.',
  })
  @ApiOkResponse({ description: 'List of recipes', type: [RecipeDto] })
  @ApiQuery({
    name: 'details',
    description: 'If true, returns all recipe data.',
    type: 'boolean',
    required: false,
  })
  @ApiQuery({
    name: 'rating',
    description:
      'Shows only recipes with average rating greater or equal than provided value.',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'category',
    description: 'Shows only recipes assinged to provided category.',
    isArray: true,
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Shows only recipes created from this day.',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Shows only recipes created till this day.',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'title',
    description: 'Shows only recipes that contain given string in the title.',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'description',
    description:
      'Shows only recipes that contain given string in the description.',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'ingredients',
    description:
      'Shows only recipes that contain given string in the ingredients.',
    type: 'string',
    required: false,
  })
  @ApiBearerAuth()
  @UseGuards(RecipesGuard)
  @Get()
  findAll(
    @Request() request,
    @Query() params: GetRecepiesFiltersDto,
  ): Promise<RecipeDto[]> {
    return this.recipesService.findAll(request.user?.userId, params);
  }
}
