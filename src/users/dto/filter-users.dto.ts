import { IsOptional, IsString, MaxLength } from 'class-validator';

export class FilterUsersDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}