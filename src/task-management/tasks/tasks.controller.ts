import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('tasks')
  async create(@Body() createTaskDto: CreateTaskDto): Promise<TaskResponseDto> {
    return await this.tasksService.create(createTaskDto);
  }

  @Get('board/:boardId/tasks')
  async findAllAfterBoardId(
    @Param('boardId') boardId: string,
  ): Promise<TaskResponseDto[]> {
    return await this.tasksService.findAllAfterBoardId(boardId);
  }

  @Patch('tasks/:id')
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return await this.tasksService.update(id, updateTaskDto);
  }

  @Delete('tasks/:id')
  async remove(@Param('id') id: string) {
    return await this.tasksService.remove(id);
  }
}
