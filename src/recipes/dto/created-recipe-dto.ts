import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { PreparationTime, Visibility } from '@prisma/client';
import { IsNotEmpty, MaxLength, IsArray, ArrayNotEmpty } from 'class-validator';

export class CreatedRecipeDto {
  @ApiProperty({
    example: faker.string.uuid(),
  })
  id: string;

  @ApiProperty({
    example: 'Spaghetti Bolognese',
  })
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    example: 'Very tasty spaghetti bolognese',
  })
  @IsNotEmpty()
  @MaxLength(200)
  description: string;

  @ApiProperty({
    example: 'lunch',
  })
  @IsNotEmpty()
  categoryName: string;

  @ApiProperty({
    example: 'link-to-image',
  })
  image: string;

  @ApiProperty({
    example: PreparationTime.OVER_60_MIN,
  })
  preparationTime: PreparationTime;

  @ApiProperty({
    example: 4,
  })
  servings: number;

  @IsArray()
  @ArrayNotEmpty()
  @ApiProperty({
    example: ['ingredient1', 'ingredient2'],
  })
  ingredients: string[];

  @IsArray()
  @ArrayNotEmpty()
  @ApiProperty({
    example: ['step1', 'step2'],
  })
  preparationSteps: string[];

  @ApiProperty({
    example: Visibility.PRIVATE,
  })
  visibility: Visibility;

  @ApiProperty({
    example: new Date(),
  })
  createdAt: Date;
}
