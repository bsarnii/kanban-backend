import { PartialType } from '@nestjs/mapped-types';
import { CreateBoardMemberDto } from './create-board-member.dto';

export class UpdateBoardMemberDto extends PartialType(CreateBoardMemberDto) {}
