import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { BoardOwnerOrEditorGuard } from './guards/board-owner-or-editor.guard';
import { BoardMemberGuard } from '../guards/board-member.guard';

@Controller('boards/:boardId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(BoardOwnerOrEditorGuard)
  async create(
    @Param('boardId') boardId: string,
    @Body() createTaskDto: CreateTaskDto
  ): Promise<TaskResponseDto> {
    return await this.tasksService.create(boardId, createTaskDto);
  }

  @Get()
  @UseGuards(BoardMemberGuard)
  async findAllAfterBoardId(
    @Param('boardId') boardId: string,
  ): Promise<TaskResponseDto[]> {
    return await this.tasksService.findAllAfterBoardId(boardId);
  }

  @Patch(':id')
  @UseGuards(BoardOwnerOrEditorGuard)
  async update(@Param('boardId') boardId: string, @Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return await this.tasksService.update(boardId, id, updateTaskDto);
  }

  @Delete(':id')
  @UseGuards(BoardOwnerOrEditorGuard)
  async remove(@Param('boardId') boardId: string, @Param('id') id: string) {
    return await this.tasksService.remove(boardId, id);
  }

  @Post('sort')
  @UseGuards(BoardOwnerOrEditorGuard)
  async sortTasks(
    @Param('boardId') boardId: string,
    @Body() taskIds: string[]
  ): Promise<TaskResponseDto[]> {
    return await this.tasksService.sortTasks(boardId, taskIds);
  }
}
