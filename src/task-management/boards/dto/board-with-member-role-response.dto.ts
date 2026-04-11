import { Board } from '../entities/board.entity';
import { BoardMemberRole } from 'src/task-management/types/board-member-role.type';

export type BoardWithMemberRoleResponseDto = Omit<Board, 'boardMembers'> & {
  boardMemberRole: BoardMemberRole | null;
};