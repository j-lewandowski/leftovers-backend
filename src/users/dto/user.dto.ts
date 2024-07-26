import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    type: 'string',
    example: 'ef179b3b-c43b-407f-808c-c07012ff0fac',
  })
  id: string;

  @ApiProperty({
    type: 'string',
    example: 'test@test.com',
  })
  email: string;

  @ApiProperty({
    type: 'date',
    example: '2024-07-24T08:41:43.201Z',
  })
  createdAt: Date;
}
