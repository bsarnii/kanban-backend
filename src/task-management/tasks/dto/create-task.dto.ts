import { IsArray, IsString, ValidateNested } from 'class-validator';
import { CreateSubtaskDto } from './create-subtask.dto';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  boardId: string;

  @IsString()
  statusId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubtaskDto)
  subtasks: CreateSubtaskDto[];
}
