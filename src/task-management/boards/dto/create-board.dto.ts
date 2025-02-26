import { Type } from 'class-transformer';
import { IsString, IsArray, ValidateNested } from 'class-validator';
import { CreateStatusDto } from './create-status.dto';

export class CreateBoardDto {
  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStatusDto)
  statuses: CreateStatusDto[];
}
