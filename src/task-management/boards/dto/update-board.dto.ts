import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateBoardDto } from './create-board.dto';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateStatusDto } from './update-status.dto';

export class UpdateBoardDto extends PartialType(
  OmitType(CreateBoardDto, ['statuses'] as const),
) {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateStatusDto)
  statuses: UpdateStatusDto[];
}
