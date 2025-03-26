import { Exclude, Expose, Transform } from 'class-transformer';
import { Subtask } from '../entities/subtask.entity';
import { Task } from '../entities/task.entity';
import { Board } from 'src/task-management/boards/entities/board.entity';
import { Status } from 'src/task-management/boards/entities/status.entity';

export class TaskResponseDto {
  id: string;

  name: string;

  description: string;

  @Transform(
    ({ obj }: { obj: Task }) =>
      obj.subtasks?.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ) || [],
  )
  subtasks: Subtask[];

  @Expose()
  @Transform(({ obj }: { obj: Task }) => obj.board?.id)
  boardId: string;

  @Expose()
  @Transform(({ obj }: { obj: Task }) => obj.status?.id)
  statusId: string | null;

  @Exclude()
  board: Board;

  @Exclude()
  status: Status;

  @Exclude()
  orderIndex: number;
}
