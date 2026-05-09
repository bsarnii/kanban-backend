import { Board } from "src/task-management/boards/entities/board.entity";

export class CreateBoardMemberDto {
  userId!: string;

  board!: Board;

  role = "owner";
}
