import { IsOptional, IsString } from 'class-validator';

export class UpdateStatusDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  name: string;
}
