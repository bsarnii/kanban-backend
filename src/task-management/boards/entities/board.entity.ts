import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Status } from './status.entity';

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
}
