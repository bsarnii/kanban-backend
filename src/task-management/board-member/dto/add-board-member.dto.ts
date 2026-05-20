import { IsEmail, IsIn } from 'class-validator';
import { BoardMemberRole } from '../../types/board-member-role.type';

export class AddBoardMemberDto {
  @IsEmail()
  email!: string;

  @IsIn(['owner', 'editor', 'viewer'])
  role!: BoardMemberRole;
}
