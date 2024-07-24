import { ApiProperty } from '@nestjs/swagger';

export class UserEmailDto {
  @ApiProperty({ example: 'email@example.com' })
  email: string;
}
