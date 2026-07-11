import { IsIn } from 'class-validator';
import { BoardMemberRole } from '../../types/board-member-role.type';

export class UpdateBoardMemberDto {
  @IsIn(['owner', 'editor', 'viewer'])
  role!: BoardMemberRole;
}
