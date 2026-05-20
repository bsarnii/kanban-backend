import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBoardMemberDto } from './dto/create-board-member.dto';
import { AddBoardMemberDto } from './dto/add-board-member.dto';
import { UpdateBoardMemberDto } from './dto/update-board-member.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BoardMember } from './entities/board-member.entity';
import { Board } from '../boards/entities/board.entity';
import { User } from '../../users/entities/user.entity';
import { BoardMemberResponseDto } from './dto/board-member-response.dto';

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

  async addByEmail(boardId: string, addBoardMemberDto: AddBoardMemberDto): Promise<BoardMemberResponseDto> {
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

    const existingMember = await this.getBoardMemberByBoardIdAndUserId(boardId, user.id);

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

  async findAll(boardId: string): Promise<BoardMemberResponseDto[]> {
    const boardMembers = await this.boardMemberRepository.find({
      where: { board: { id: boardId } },
    });

    const userIds = [...new Set(boardMembers.map((boardMember) => boardMember.userId))];
    const users = userIds.length
      ? await this.userRepository.find({
          where: { id: In(userIds) },
          select: ['id', 'email'],
        })
      : [];

    const emailByUserId = new Map(users.map((user) => [user.id, user.email]));

    return boardMembers.map((boardMember) => ({
      id: boardMember.id,
      email: emailByUserId.get(boardMember.userId) ?? 'Unknown',
      role: boardMember.role,
    }));
  }

  findOne(id: number) {
    return `This action returns a #${id} boardMember`;
  }

  async update(
    id: string,
    updateBoardMemberDto: UpdateBoardMemberDto,
  ): Promise<BoardMemberResponseDto> {
    const boardMember = await this.boardMemberRepository.findOne({
      where: { id },
    });


    if (!boardMember) {
      throw new NotFoundException('Board member not found');
    }

    boardMember.role = updateBoardMemberDto.role;
    const savedBoardMember = await this.boardMemberRepository.save(boardMember);

    const user = await this.userRepository.findOne({
      where: { id: savedBoardMember.userId },
      select: ['email'],
    });

    return {
      id: savedBoardMember.id,
      email: user?.email ?? 'Unknown',
      role: savedBoardMember.role,
    };
  }

  async remove(id: string): Promise<null> {
    return await this.boardMemberRepository.delete(id).then(() => null);
  }

  async getBoardMemberByBoardIdAndUserId(boardId: string, userId: string): Promise<BoardMember | null> {
    return await this.boardMemberRepository.findOne({
      where: { board: { id: boardId }, userId },
    });
  }
}
