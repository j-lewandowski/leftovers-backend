import { ApiProperty } from '@nestjs/swagger';
import { plainToClass, Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { SortDirection } from '../enums/sort-direction.enum';
import { SortField } from '../enums/sort-field.enum';

class SortCondition {
  @IsEnum(SortField, {
    message: 'Invalid sort field. Allowed values: createdAt, rating.',
  })
  field: SortField;

  @IsEnum(SortDirection, {
    message: 'Invalid sort direction. Allowed values: asc, desc.',
  })
  direction: SortDirection;
}

export class GetRecipesFiltersDto {
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
    name: 'saved',
    description:
      'Shows only saved or not saved recipes. If not provided, returns all recipes.',
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  saved?: boolean;

  @ApiProperty({
    name: 'details',
    description: 'If true, returns all recipe data.',
    type: 'boolean',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  details?: boolean = false;

  @ApiProperty({
    name: 'userId',
    description: 'Shows only recipes created by given user.',
    type: 'string',
    required: false,
  })
  userId?: string;

  @ApiProperty({
    name: 'myRecipes',
    description: 'Shows only recipes created by user.',
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  myRecipes?: boolean;

  @IsOptional()
  @ApiProperty({
    name: 'sort',
    description:
      'Sorts recipes by given field. Allowed values: createdAt, rating.',
    type: 'string',
    example: 'createdAt,desc',
    required: false,
  })
  @Transform(({ value }) => {
    const sortParams = Array.isArray(value) ? value : [value];

    return sortParams.map((param: string) => {
      const [field, direction] = param.split(',');

      return plainToClass(SortCondition, { field, direction });
    });
  })
  @ValidateNested({ each: true })
  @Type(() => SortCondition)
  sort?: SortCondition[];
}
