import { Board } from 'src/task-management/boards/entities/board.entity';
import { Status } from 'src/task-management/boards/entities/status.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Subtask } from './subtask.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => Board, (board) => board.tasks, {
    onDelete: 'CASCADE',
    eager: true,
  }) // Ensures tasks are deleted if board is deleted
  @JoinColumn({ name: 'boardId' }) // Explicitly defines the foreign key column
  board: Board;

  @ManyToOne(() => Status, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: true,
  }) // Ensures status is set to null if status is deleted
  @JoinColumn({ name: 'statusId' }) // Explicitly defines the foreign key column
  status?: Status;

  @OneToMany(() => Subtask, (subtask) => subtask.task, {
    cascade: true,
    eager: true,
  })
  subtasks: Subtask[];
}
