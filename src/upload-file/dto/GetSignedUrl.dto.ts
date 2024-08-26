import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetSignedUrlDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: faker.string.uuid(),
  })
  userId: string;
  @IsNotEmpty()
  @ApiProperty({
    example: 'Spaghetti Bolognese',
  })
  recipeTitle: string;
}
