import { PreparationTime, Visibility } from '@prisma/client';
import { ArrayNotEmpty, IsArray, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateRecipeDto {
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsNotEmpty()
  @MaxLength(200)
  description: string;

  @IsNotEmpty()
  categoryName: string;

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
