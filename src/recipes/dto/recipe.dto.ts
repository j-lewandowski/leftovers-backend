import { faker } from '@faker-js/faker';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecipeDto {
  @ApiProperty({
    type: 'string',
    example: '452b9e46-1ca2-4201-aa4e-df50f331c25a',
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

  @ApiPropertyOptional({
    type: 'string',
    example: 'UP_TO_15_MIN',
  })
  preparationTime?: string;

  @ApiPropertyOptional({
    type: 'string[]',
    example: ['tomatos', 'pasta', 'ground beef'],
  })
  ingredients?: string[];

  @ApiPropertyOptional({
    type: 'string[]',
    example: ['1 step', '2 step', '3 step'],
  })
  preparationSteps?: string[];

  @ApiPropertyOptional({
    type: 'PRIVATE | PUBLIC',
    example: 'PUBLIC',
  })
  visibility?: 'PRIVATE' | 'PUBLIC';

  @ApiPropertyOptional({
    type: 'Date',
    example: '2024-08-05 09:22:28.250',
  })
  createdAt?: Date;

  @ApiPropertyOptional({
    type: 'string',
    example: '1711d42a-40b4-42e8-80de-52ba3469cd36',
  })
  authorId?: string;

  @ApiPropertyOptional({
    type: 'string',
    example: 'dinner',
    name: 'category',
    description: 'Shows only recipes assinged to provided category.',
    isArray: true,
  })
  categoryName?: string;

  @ApiProperty({
    type: 'number',
    example: '4.75',
  })
  rating: number;

  @ApiProperty({
    type: 'number',
    example: '2',
  })
  servings?: number;

  @ApiProperty({
    type: 'string',
    example: faker.internet.url(),
  })
  imageUrl: string;
}
