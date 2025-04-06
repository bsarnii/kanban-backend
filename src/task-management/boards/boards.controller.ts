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

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  async create(
    @Body() createBoardDto: CreateBoardDto,
    @Request() request: Req,
  ) {
    const user = request.user as JwtAuthTokenPayload;
    return await this.boardsService.create(createBoardDto, user.userId);
  }

  @Get()
  async findAllAfterUser(@Request() request: Req) {
    const user = request.user as JwtAuthTokenPayload;
    return await this.boardsService.findAllAfterUser(user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.boardsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBoardDto: UpdateBoardDto,
  ) {
    return await this.boardsService.update(id, updateBoardDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.boardsService.remove(id);
  }
}
