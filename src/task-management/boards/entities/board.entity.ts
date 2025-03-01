import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Status } from './status.entity';
import { Task } from 'src/task-management/tasks/entities/task.entity';

@Entity()
export class Board {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => Status, (status) => status.board, {
    cascade: true,
    eager: true,
  })
  statuses: Status[];

  @OneToMany(() => Task, (task) => task.board)
  tasks: Task[];
}
