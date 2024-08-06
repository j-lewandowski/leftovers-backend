import { Transform } from 'class-transformer';
import { IsDateString, IsInt, IsOptional } from 'class-validator';

export class GetRecepiesFiltersDto {
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  category?: string[];

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseFloat(value))
  rating?: number;

  @IsOptional()
  @IsDateString()
  startDate?: number;

  @IsOptional()
  @IsDateString()
  endDate?: number;
}
