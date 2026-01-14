import type { ContentType } from '@/data/data.types';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, IsString, Min, MinLength } from 'class-validator';

export class CreateContentDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsString()
  @MinLength(3)
  subject!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  previewUrl?: string;

  @IsOptional()
  @IsString()
  type?: ContentType;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  lessons!: number;
}


