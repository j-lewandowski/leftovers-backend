import { PreparationTime, Visibility } from '@prisma/client';
import { IsNotEmpty, MaxLength, IsArray, ArrayNotEmpty } from 'class-validator';

export class CreatedRecipeDto {
  id: string;

  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsNotEmpty()
  @MaxLength(200)
  description: string;

  @IsNotEmpty()
  categoryName: string;

  image: string;

  preparationTime: PreparationTime;

  servings: number;

  @IsArray()
  @ArrayNotEmpty()
  ingredients: string[];

  @IsArray()
  @ArrayNotEmpty()
  preparationSteps: string[];

  visibility: Visibility;
}
