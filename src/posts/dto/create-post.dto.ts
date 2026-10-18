import {
  IsInt,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(1)
  content!: string;

  @IsInt()
  @Min(1)
  userId!: number;
}