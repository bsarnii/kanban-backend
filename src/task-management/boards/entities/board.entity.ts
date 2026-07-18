import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Status } from './status.entity';
import { Task } from '../../tasks/entities/task.entity';
import { BoardMember } from '../../board-member/entities/board-member.entity';

@Entity()
export class Board {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @CreateDateColumn()
  public createdAt: Date;

  @OneToMany(() => Status, (status) => status.board, {
    cascade: true,
    eager: true,
  })
  statuses: Status[];

  @OneToMany(() => Task, (task) => task.board)
  tasks: Task[];

  @Column()
  createdBy: string;

  @OneToMany(() => BoardMember, (boardMember) => boardMember.board, {
    cascade: true,
  })
  boardMembers: BoardMember[];
}
