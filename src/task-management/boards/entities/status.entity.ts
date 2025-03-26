import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Board } from './board.entity';

@Entity()
export class Status {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @CreateDateColumn()
  public createdAt: Date;

  @ManyToOne(() => Board, (board) => board.statuses, { onDelete: 'CASCADE' }) // Ensures statuses are deleted if board is deleted
  @JoinColumn({ name: 'boardId' }) // Explicitly defines the foreign key column
  board: Board;
}
