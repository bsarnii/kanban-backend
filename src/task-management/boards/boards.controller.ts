import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Request as Req } from 'express';
import { JwtAuthTokenPayload } from 'src/auth/types/jwt-auth-token-payload.type';
import { BoardWithMemberRoleResponseDto } from './dto/board-with-member-role-response.dto';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  async create(
    @Body() createBoardDto: CreateBoardDto,
    @Request() request: Req,
  ): Promise<BoardWithMemberRoleResponseDto> {
    const user = request.user as JwtAuthTokenPayload;
    return await this.boardsService.create(createBoardDto, user.userId);
  }

  @Get()
  async findAllAfterUser(
    @Request() request: Req,
  ): Promise<BoardWithMemberRoleResponseDto[]> {
    const user = request.user as JwtAuthTokenPayload;
    return await this.boardsService.findAllWithBoardMemberRole(user.userId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() request: Req,
  ): Promise<BoardWithMemberRoleResponseDto> {
    const user = request.user as JwtAuthTokenPayload;
    return await this.boardsService.findOne(id, user.userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBoardDto: UpdateBoardDto,
    @Request() request: Req,
  ): Promise<BoardWithMemberRoleResponseDto> {
    const user = request.user as JwtAuthTokenPayload;
    return await this.boardsService.update(id, updateBoardDto, user.userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.boardsService.remove(id);
  }
}
