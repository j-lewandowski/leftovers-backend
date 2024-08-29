import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccessTokenUserDataDto } from 'src/auth/dto/access-token-user-data.dto';
import { GetUser } from 'src/auth/getUser.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { CreatedRecipeDto } from './dto/created-recipe-dto';
import { GetRecepiesFiltersDto } from './dto/get-recepies-filter.dto';
import { RecipeDto } from './dto/recipe.dto';
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
  @ApiOkResponse({ description: 'List of recipes', type: [RecipeDto] })
  @ApiBearerAuth()
  @UseGuards(RecipesGuard)
  @Get()
  findAll(
    @GetUser() user: AccessTokenUserDataDto,
    @Query() params: GetRecepiesFiltersDto,
  ): Promise<RecipeDto[]> {
    return this.recipesService.findAll(user?.userId, params);
  }

  @ApiOperation({ summary: 'Allows to get single recipe by its id.' })
  @ApiCreatedResponse({ description: 'Recipe details', type: RecipeDto })
  @ApiNotFoundResponse({ description: 'Recipe with this id does not exist.' })
  @ApiForbiddenResponse({ description: "You can't access this recipe." })
  @UseGuards(RecipesGuard)
  @Get(':id')
  findOne(
    @Param('id') recipeId: string,
    @GetUser() user: AccessTokenUserDataDto,
  ): Promise<RecipeDto> {
    return this.recipesService.findOne(recipeId, user?.userId);
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
    type: CreatedRecipeDto,
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
  ): Promise<CreateRecipeDto> {
    return this.recipesService.create(createRecipeDto, user.userId);
  }
}
