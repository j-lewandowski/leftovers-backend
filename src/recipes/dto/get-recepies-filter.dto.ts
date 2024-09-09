import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsInt, IsOptional } from 'class-validator';

export class GetRecepiesFiltersDto {
  @ApiProperty({
    name: 'category',
    description: 'Shows only recipes assinged to provided category.',
    isArray: true,
    type: 'string',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  category?: string[];

  @ApiProperty({
    name: 'rating',
    description:
      'Shows only recipes with average rating greater or equal than provided value.',
    type: 'number',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseFloat(value))
  rating?: number;

  @ApiProperty({
    name: 'startDate',
    description: 'Shows only recipes created from this day.',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  startDate?: Date;

  @ApiProperty({
    name: 'endDate',
    description: 'Shows only recipes created till this day.',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  endDate?: Date;

  @ApiProperty({
    name: 'title',
    description: 'Shows only recipes that contain given string in the title.',
    type: 'string',
    required: false,
  })
  @IsOptional()
  title?: string;

  @ApiProperty({
    name: 'description',
    description:
      'Shows only recipes that contain given string in the description.',
    type: 'string',
    required: false,
  })
  @IsOptional()
  description?: string;

  @ApiProperty({
    name: 'ingredients',
    description:
      'Shows only recipes that contain given string in the ingredients.',
    type: 'string',
    required: false,
  })
  @IsOptional()
  ingredients?: string;

  @IsOptional()
  steps?: string;

  @ApiProperty({
    name: 'details',
    description: 'If true, returns all recipe data.',
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  details?: boolean = false;

  userId?: string;
}
