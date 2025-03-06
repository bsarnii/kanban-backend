import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateSubtaskDto {
  @IsString()
  name: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
