/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { Status } from './status.entity';
import { Task } from 'src/task-management/tasks/entities/task.entity';

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
}
