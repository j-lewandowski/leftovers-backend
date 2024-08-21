import { ApiProperty } from '@nestjs/swagger';
import { PreparationTime, Visibility } from '@prisma/client';
import { ArrayNotEmpty, IsArray, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateRecipeDto {
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    example: 'Spaghetti Bolognese',
  })
  title: string;

  @IsNotEmpty()
  @MaxLength(200)
  @ApiProperty({
    example: 'Very tasty spaghetti bolognese',
  })
  description: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'lunch',
  })
  categoryName: string;

  @IsNotEmpty()
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
}
