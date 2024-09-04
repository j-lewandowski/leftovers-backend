import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: faker.internet.password(),
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
  @ApiProperty({
    example: 'validation-token',
  })
  @IsString()
  @IsNotEmpty()
  validationToken: string;
}
