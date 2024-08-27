import { ApiProperty } from '@nestjs/swagger';
import { PreparationTime, Visibility } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

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

  @IsNotEmpty()
  @IsEnum(PreparationTime)
  @ApiProperty({
    example: PreparationTime.OVER_60_MIN,
  })
  preparationTime: PreparationTime;

  @ApiProperty({
    example: 4,
  })
  servings: number;

  @ApiProperty({
    example: ['ingredient1', 'ingredient2'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  ingredients: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  @ApiProperty({
    example: ['step1', 'step2'],
  })
  preparationSteps: string[];

  @IsNotEmpty()
  @ApiProperty({
    example: Visibility.PRIVATE,
  })
  @IsEnum(Visibility)
  visibility: Visibility;
}
