import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { RecipeDto } from './recipe.dto';

export class OutputRecipeDto extends RecipeDto {
  @ApiProperty({
    type: 'string',
    example: faker.internet.url(),
  })
  imageUrl: string;
}
