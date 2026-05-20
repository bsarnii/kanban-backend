import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BoardMemberService } from './board-member.service';
import { AddBoardMemberDto } from './dto/add-board-member.dto';
import { UpdateBoardMemberDto } from './dto/update-board-member.dto';
import { BoardOwnerGuard } from './guards/board-owner.guard';
import { BoardMemberGuard } from '../guards/board-member.guard';

@Controller('boards/:boardId/board-members')
@UseGuards(BoardMemberGuard)
export class BoardMemberController {
  constructor(private readonly boardMemberService: BoardMemberService) {}

  @Post()
  @UseGuards(BoardOwnerGuard)
  create(
    @Param('boardId') boardId: string,
    @Body() addBoardMemberDto: AddBoardMemberDto,
  ) {
    return this.boardMemberService.addByEmail(boardId, addBoardMemberDto);
  }

  @Get()
  findAllAfterBoardId(@Param('boardId') boardId: string) {
    return this.boardMemberService.findAll(boardId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boardMemberService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(BoardOwnerGuard)
  update(
    @Param('id') id: string,
    @Body() updateBoardMemberDto: UpdateBoardMemberDto,
  ) {
    return this.boardMemberService.update(id, updateBoardMemberDto);
  }

  @Delete(':id')
  @UseGuards(BoardOwnerGuard)
  remove(@Param('id') id: string) {
    return this.boardMemberService.remove(id);
  }
}
