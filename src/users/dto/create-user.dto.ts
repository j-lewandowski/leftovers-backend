import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    type: 'string',
    example: 'test@test.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    type: 'string',
    example: 'secure-password',
    minLength: 5,
    maxLength: 255,
  })
  @MinLength(5)
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  password: string;
}
