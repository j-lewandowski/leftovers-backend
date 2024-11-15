import { ApiProperty } from '@nestjs/swagger';
import { OutputRecipeDto } from './output-recipe.dto';

export class PaginatedRecipesDto {
  @ApiProperty({
    type: OutputRecipeDto,
    isArray: true,
  })
  recipes: OutputRecipeDto[];

  @ApiProperty({
    type: 'number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    type: 'number',
    example: 50,
  })
  limit: number;

  @ApiProperty({
    type: 'number',
    example: 100,
  })
  totalRecipes: number;
}
