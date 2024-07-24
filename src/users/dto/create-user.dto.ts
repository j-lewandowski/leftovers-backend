import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

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
  })
  @MinLength(5)
  @IsNotEmpty()
  password: string;
}
