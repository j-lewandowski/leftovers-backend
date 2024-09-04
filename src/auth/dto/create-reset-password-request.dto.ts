import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CreateResetPasswordRequestDto {
  @ApiProperty({ example: faker.internet.email() })
  @IsEmail()
  email: string;
}
