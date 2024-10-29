import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { Visibility } from '@prisma/client';

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

  @ApiProperty({
    type: 'boolean',
    example: true,
  })
  isSaved: boolean;

  @ApiProperty({
    type: 'number',
    example: 12,
  })
  numberOfRatings: number;

  @ApiProperty({
    type: 'string',
    example: Visibility.PUBLIC,
  })
  visibility: Visibility;
}
