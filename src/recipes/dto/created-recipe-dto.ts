import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { PreparationTime, Visibility } from '@prisma/client';

export class CreatedRecipeDto {
  @ApiProperty({
    example: faker.string.uuid(),
  })
  id: string;

  @ApiProperty({
    example: 'Spaghetti Bolognese',
  })
  title: string;

  @ApiProperty({
    example: 'Very tasty spaghetti bolognese',
  })
  description: string;

  @ApiProperty({
    example: 'lunch',
  })
  categoryName: string;

  @ApiProperty({
    example: 'image-key',
  })
  imageKey: string;

  @ApiProperty({
    example: PreparationTime.OVER_60_MIN,
  })
  preparationTime: PreparationTime;

  @ApiProperty({
    example: 4,
  })
  servings: number;

  @ApiProperty({
    example: 4,
  })
  rating: number;

  @ApiProperty({
    example: ['ingredient1', 'ingredient2'],
  })
  ingredients: string[];

  @ApiProperty({
    example: ['step1', 'step2'],
  })
  preparationSteps: string[];

  @ApiProperty({
    example: Visibility.PRIVATE,
  })
  visibility: Visibility;

  @ApiProperty({
    type: 'string',
    example: '1711d42a-40b4-42e8-80de-52ba3469cd36',
  })
  authorId: string;

  @ApiProperty({
    example: new Date(),
  })
  createdAt: Date;
}
