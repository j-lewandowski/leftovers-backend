import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class SaveRecipeDto {
  @ApiProperty({
    type: 'string',
    example: 'recipe-id',
  })
  @IsString()
  @IsNotEmpty()
  recipeId: string;

  @ApiProperty({
    type: 'boolean',
    example: 'true',
  })
  @IsBoolean()
  @IsNotEmpty()
  save: boolean;
}
