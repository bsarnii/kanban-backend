import { PartialType } from '@nestjs/mapped-types';
import { CreateSubtaskDto } from './create-subtask.dto';
import { IsString } from 'class-validator';

export class UpdateSubtaskDto extends PartialType(CreateSubtaskDto) {
  @IsString()
  id: string;
}
