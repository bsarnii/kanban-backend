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

@Controller('boards/:boardId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(BoardOwnerOrEditorGuard)
  async create(@Body() createTaskDto: CreateTaskDto): Promise<TaskResponseDto> {
    return await this.tasksService.create(createTaskDto);
  }

  @Get()
  async findAllAfterBoardId(
    @Param('boardId') boardId: string,
  ): Promise<TaskResponseDto[]> {
    return await this.tasksService.findAllAfterBoardId(boardId);
  }

  @Patch(':id')
  @UseGuards(BoardOwnerOrEditorGuard)
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return await this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @UseGuards(BoardOwnerOrEditorGuard)
  async remove(@Param('id') id: string) {
    return await this.tasksService.remove(id);
  }

  @Post('sort')
  @UseGuards(BoardOwnerOrEditorGuard)
  async sortTasks(@Body() taskIds: string[]): Promise<TaskResponseDto[]> {
    return await this.tasksService.sortTasks(taskIds);
  }
}
