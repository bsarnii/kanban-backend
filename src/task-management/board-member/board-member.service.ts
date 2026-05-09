import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBoardMemberDto } from './dto/create-board-member.dto';
import { AddBoardMemberDto } from './dto/add-board-member.dto';
import { UpdateBoardMemberDto } from './dto/update-board-member.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardMember } from './entities/board-member.entity';
import { Board } from '../boards/entities/board.entity';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class BoardMemberService {
  constructor(
    @InjectRepository(BoardMember)
    private boardMemberRepository: Repository<BoardMember>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  create(createBoardMemberDto: CreateBoardMemberDto) {
    const { userId, board } = createBoardMemberDto;

    const boardMember = this.boardMemberRepository.create({
      userId,
      board,
      role: "owner"
    });

    return this.boardMemberRepository.save(boardMember);
  }

  async addByEmail(boardId: string, addBoardMemberDto: AddBoardMemberDto) {
    const { email, role } = addBoardMemberDto;

    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingMember = await this.boardMemberRepository.findOne({
      where: {
        board: { id: boardId },
        userId: user.id,
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already a board member');
    }

    const boardMember = this.boardMemberRepository.create({
      userId: user.id,
      board,
      role,
    });

    const savedBoardMember = await this.boardMemberRepository.save(boardMember);

    return {
      id: savedBoardMember.id,
      email: user.email,
      role: savedBoardMember.role,
    };
  }

  findAll(boardId: string) {
    return this.boardMemberRepository.find({
      where: { board: { id: boardId } }
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} boardMember`;
  }

  update(id: number, updateBoardMemberDto: UpdateBoardMemberDto) {
    return `This action updates a #${id} boardMember`;
  }

  remove(id: number) {
    return `This action removes a #${id} boardMember`;
  }
}
