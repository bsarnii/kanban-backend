import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateSubtaskDto } from './update-subtask.dto';
import { CreateSubtaskDto } from './create-subtask.dto';

export class UpdateTaskDto extends PartialType(
  OmitType(CreateTaskDto, ['subtasks'] as const),
) {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubtaskDto || UpdateSubtaskDto)
  subtasks?: Array<CreateSubtaskDto | UpdateSubtaskDto>;
}
