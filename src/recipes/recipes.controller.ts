import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipesGuard } from './recipes.guard';
import { GetRecepiesFiltersDto } from './dto/get-recepies-filter.dto';
import { RecipeDto } from './dto/recipe.dto';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRecipeDto } from './dto/create-recipe.dto';

@Controller('recipes')
@ApiTags('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @ApiOperation({
    summary:
      'Allows to get all recipes and filter them. When provided with valid jwt also returns private recipes user has created.',
  })
  @ApiOkResponse({ description: 'List of recipes', type: [RecipeDto] })
  @ApiBearerAuth()
  @UseGuards(RecipesGuard)
  @Get()
  findAll(
    @Request() request,
    @Query() params: GetRecepiesFiltersDto,
  ): Promise<RecipeDto[]> {
    return this.recipesService.findAll(request.user?.userId, params);
  }

  @ApiOperation({ summary: 'Allows to get single recipe by its id.' })
  @ApiOkResponse({ description: 'Recipe details', type: RecipeDto })
  @ApiNotFoundResponse({ description: 'Recipe with this id does not exist.' })
  @ApiForbiddenResponse({ description: "You can't access this recipe." })
  @UseGuards(RecipesGuard)
  @Get(':id')
  findOne(
    @Param('id') recipeId: string,
    @Request() request,
  ): Promise<RecipeDto> {
    return this.recipesService.findOne(recipeId, request.user?.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Request() request,
    @Body() createRecipeDto: CreateRecipeDto,
  ): Promise<CreateRecipeDto> {
    return this.recipesService.create(createRecipeDto, request.user.userId);
  }
}
