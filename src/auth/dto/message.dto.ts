import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty({
    example: 'Message from an endpoint.',
  })
  message: string;
}
