import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class SaveRecipeDto {
  @IsString()
  @IsNotEmpty()
  recipeId: string;
  @IsBoolean()
  @IsNotEmpty()
  save: boolean;
}
