import { ApiPropertyOptional } from '@nestjs/swagger';
import { RecipeDto } from './recipe.dto';

export class QueryRecipeDto extends RecipeDto {
  @ApiPropertyOptional({
    type: 'string',
    example: 'image/key',
  })
  imageKey: string;
}
