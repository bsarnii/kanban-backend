import { Injectable } from '@nestjs/common';
import { CreateBoardMemberDto } from './dto/create-board-member.dto';
import { UpdateBoardMemberDto } from './dto/update-board-member.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardMember } from './entities/board-member.entity';

@Injectable()
export class BoardMemberService {
  constructor(
    @InjectRepository(BoardMember)
    private boardMemberRepository: Repository<BoardMember>
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

  findAll() {
    return `This action returns all boardMember`;
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
