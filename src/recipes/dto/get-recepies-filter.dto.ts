import { Transform } from 'class-transformer';
import { IsDate, IsInt, IsOptional } from 'class-validator';

export class GetRecepiesFiltersDto {
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  category?: string[];

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseFloat(value))
  rating?: number;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  endDate?: Date;

  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  ingredients?: string;

  @IsOptional()
  steps?: string;

  @IsOptional()
  details?: boolean = false;
}
