import { IsOptional, IsString, MaxLength } from 'class-validator';

export class FilterPostsDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;
}