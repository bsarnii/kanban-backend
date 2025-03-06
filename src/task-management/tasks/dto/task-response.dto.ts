import { Exclude, Expose, Transform } from 'class-transformer';
import { Subtask } from '../entities/subtask.entity';
import { Task } from '../entities/task.entity';
import { Board } from 'src/task-management/boards/entities/board.entity';
import { Status } from 'src/task-management/boards/entities/status.entity';

export class TaskResponseDto {
  id: string;

  name: string;

  description: string;

  subtasks: Subtask[]; // Directly include subtasks

  @Expose()
  @Transform(({ obj }: { obj: Task }) => obj.board.id)
  boardId: string;

  @Expose()
  @Transform(({ obj }: { obj: Task }) => obj.status?.id)
  statusId: string | null;

  @Exclude()
  board: Board;

  @Exclude()
  status: Status;
}
