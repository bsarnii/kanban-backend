import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Board } from './board.entity';
import { Task } from 'src/task-management/tasks/entities/task.entity';

@Entity()
export class Status {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Board, (board) => board.statuses, { onDelete: 'CASCADE' }) // Ensures statuses are deleted if board is deleted
  @JoinColumn({ name: 'boardId' }) // Explicitly defines the foreign key column
  board: Board;

  @OneToMany(() => Task, (task) => task.board)
  tasks: Task[];
}
