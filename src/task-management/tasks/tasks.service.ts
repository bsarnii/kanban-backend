import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Subtask } from './entities/subtask.entity';
import { Task } from './entities/task.entity';
import { Equal, Repository } from 'typeorm';
import { Board } from '../boards/entities/board.entity';
import { Status } from '../boards/entities/status.entity';
import { plainToInstance } from 'class-transformer';
import { TaskResponseDto } from './dto/task-response.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,

    @InjectRepository(Subtask)
    private subtaskRepository: Repository<Subtask>,

    @InjectRepository(Board)
    private boardRepository: Repository<Board>,

    @InjectRepository(Status)
    private statusRepository: Repository<Status>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<TaskResponseDto> {
    const { name, description, boardId, statusId, subtasks } = createTaskDto;

    // 🔹 Check if board exists
    const boardExists = await this.boardRepository.findOne({
      where: { id: boardId },
    });
    if (!boardExists) {
      throw new NotFoundException(`Board with ID ${boardId} not found.`);
    }

    // 🔹 Check if status exists
    const statusExists = await this.statusRepository.findOne({
      where: { id: statusId },
    });
    if (!statusExists) {
      throw new NotFoundException(`Status with ID ${statusId} not found.`);
    }

    // 🔹 Convert subtasks to `Subtask` entities
    const subtaskEntities = subtasks.map((subtask) =>
      this.subtaskRepository.create({
        name: subtask.name,
        completed: subtask.completed,
      }),
    );

    const task = this.taskRepository.create({
      name,
      description,
      board: { id: boardId }, // Only assign the board ID, not the full entity
      status: { id: statusId }, // Only assign the status ID
      subtasks: subtaskEntities,
    });

    const savedTask = await this.taskRepository.save(task);

    // Transform entity into DTO before returning
    return plainToInstance(TaskResponseDto, savedTask);
  }

  async findAllAfterBoardId(boardId: string): Promise<TaskResponseDto[]> {
    // 🔹 Check if board exists
    const boardExists = await this.boardRepository.findOneBy({
      id: Equal(boardId),
    });
    if (!boardExists) {
      throw new NotFoundException(`Board with ID ${boardId} not found.`);
    }

    const tasks = await this.taskRepository.find({
      where: { board: { id: boardId } },
    });
    console.log(tasks);

    // Transform entities into DTOs before returning
    return plainToInstance(TaskResponseDto, tasks);
  }
  /*

  findAll() {
    return `This action returns all tasks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} task`;
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }
    */
}
