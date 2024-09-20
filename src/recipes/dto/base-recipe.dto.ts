import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';

export class BaseRecipeDto {
  @ApiProperty({
    example: faker.string.uuid(),
  })
  id: string;

  @ApiProperty({
    type: 'string',
    example: 'Spaghetti Bolognese',
  })
  title: string;

  @ApiProperty({
    type: 'string',
    example: 'Example description',
  })
  description: string;

  @ApiProperty({
    type: 'number',
    example: '4.75',
  })
  rating: number;
}
