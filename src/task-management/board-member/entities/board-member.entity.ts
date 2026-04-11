import { Board } from '../../boards/entities/board.entity'
import { BoardMemberRole } from '../../types/board-member-role.type'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class BoardMember {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  userId: string

  @ManyToOne(() => Board, (board) => board.boardMembers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Column()
  role: BoardMemberRole;
}