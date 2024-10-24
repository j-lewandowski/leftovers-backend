import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Recipe } from '@prisma/client';
import { AccessTokenUserDataDto } from '../auth/dto/access-token-user-data.dto';
import { GetUser } from '../auth/getUser.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RatingDto } from './dto/create-rating.dto';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { GetRecipesFiltersDto } from './dto/get-recipes-filter.dto';
import { OutputRecipeDto } from './dto/output-recipe.dto';
import { RecipesGuard } from './recipes.guard';
import { RecipesService } from './recipes.service';

@Controller('recipes')
@ApiTags('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @ApiOperation({
    summary:
      'Allows to get all recipes and filter them. When provided with valid jwt also returns private recipes user has created.',
  })
  @ApiOkResponse({ description: 'List of recipes', type: [OutputRecipeDto] })
  @ApiBearerAuth()
  @UseGuards(RecipesGuard)
  @Get()
  findAll(
    @GetUser() user: AccessTokenUserDataDto,
    @Query() queryParams: GetRecipesFiltersDto,
  ): Promise<OutputRecipeDto[]> {
    return this.recipesService.findAll(user?.userId, {
      ...queryParams,
    });
  }

  @ApiOperation({
    summary: 'Allows to create new recipe.',
  })
  @ApiBadRequestResponse({
    description: 'Missing fields or invalid data.',
    example: {
      message: ['title should not be empty'],
      error: 'Bad Request',
      statusCode: 400,
    },
  })
  @ApiCreatedResponse({
    description: 'Recipe has been created.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token expired.',
    example: {
      message: 'Unauthorized',
      statusCode: 401,
    },
  })
  @ApiBearerAuth()
  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @GetUser() user: AccessTokenUserDataDto,
    @Body() createRecipeDto: CreateRecipeDto,
  ): Promise<Recipe> {
    return this.recipesService.create(createRecipeDto, user.userId);
  }

  @ApiOperation({
    summary: 'Allows to refresh recipe of the day.',
  })
  @ApiOkResponse({
    description: 'Recipe of the day updated successfully.',
  })
  @Cron('00 12 * * *')
  @Put('/recipe-of-the-day')
  async refreshRecipeOfTheDay(): Promise<void> {
    await this.recipesService.refreshRecipeOfTheDay();
  }

  @ApiOperation({
    summary: 'Allows to get recipe of the day.',
  })
  @ApiOkResponse({
    description: 'Recipe of the day.',
    type: OutputRecipeDto,
  })
  @Get('/recipe-of-the-day')
  getRecipeOfTheDay() {
    return this.recipesService.getRecipeOfTheDay();
  }

  @ApiOperation({ summary: 'Allows to get single recipe by its id.' })
  @ApiCreatedResponse({ description: 'Recipe details', type: OutputRecipeDto })
  @ApiNotFoundResponse({ description: 'Recipe with this id does not exist.' })
  @ApiForbiddenResponse({ description: "You can't access this recipe." })
  @UseGuards(RecipesGuard)
  @Get(':id')
  findOne(
    @Param('id') recipeId: string,
    @GetUser() user: AccessTokenUserDataDto,
  ): Promise<OutputRecipeDto> {
    return this.recipesService.findOne(recipeId, user?.userId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Allows to delete recipe.',
  })
  @ApiOkResponse({
    description: 'Recipe has been deleted.',
  })
  @ApiNotFoundResponse({
    description: 'Recipe with this id does not exist.',
  })
  @ApiForbiddenResponse({
    description: "You can't delete this recipe.",
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async remove(
    @GetUser() user: AccessTokenUserDataDto,
    @Param('id') recipeId: string,
  ): Promise<void> {
    await this.recipesService.remove(recipeId, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Allows to rate a recipe' })
  @ApiCreatedResponse({ description: 'Recipe rated successfully' })
  @ApiConflictResponse({ description: 'Recipe is already rated by the user' })
  @Post(':id/rate-recipe')
  async rateRecipe(
    @GetUser() user: AccessTokenUserDataDto,
    @Param('id') recipeId: string,
    @Body() rating: RatingDto,
  ) {
    await this.recipesService.rateRecipe(recipeId, user.userId, rating.value);
  }
}
