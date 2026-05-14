import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BoardMemberService } from './board-member.service';
import { AddBoardMemberDto } from './dto/add-board-member.dto';
import { UpdateBoardMemberDto } from './dto/update-board-member.dto';

@Controller('boards/:boardId/board-members')
export class BoardMemberController {
  constructor(private readonly boardMemberService: BoardMemberService) {}

  @Post()
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
  update(
    @Param('boardId') boardId: string,
    @Param('id') id: string,
    @Body() updateBoardMemberDto: UpdateBoardMemberDto,
  ) {
    return this.boardMemberService.update(boardId, id, updateBoardMemberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boardMemberService.remove(id);
  }
}
