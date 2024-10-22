import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetSignedUrlDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'Spaghetti Bolognese',
  })
  recipeTitle: string;
}
