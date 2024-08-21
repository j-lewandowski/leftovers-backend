import { IsNotEmpty } from 'class-validator';

export class GetSignedUrlDto {
  @IsNotEmpty()
  userId: string;
  @IsNotEmpty()
  recipeTitle: string;
}
