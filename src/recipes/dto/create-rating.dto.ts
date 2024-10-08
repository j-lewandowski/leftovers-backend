import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class RatingDto {
  @ApiProperty({
    type: 'number',
    example: '3',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(5)
  value: number;
}
