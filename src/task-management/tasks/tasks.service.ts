import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Subtask } from './entities/subtask.entity';
import { Task } from './entities/task.entity';
import { Equal, In, Repository } from 'typeorm';
import { Board } from '../boards/entities/board.entity';
import { Status } from '../boards/entities/status.entity';
import { plainToInstance } from 'class-transformer';
import { TaskResponseDto } from './dto/task-response.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

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

    const lastTask = await this.taskRepository.findOne({
      where: { board: { id: boardId } },
      order: { orderIndex: 'DESC' },
    });
    const orderIndex = lastTask ? lastTask.orderIndex + 1 : 1;

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
      orderIndex,
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

    // Transform entities into DTOs before returning
    const sortedTasks = tasks.sort((a, b) => a.orderIndex - b.orderIndex);
    return plainToInstance(TaskResponseDto, sortedTasks);
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    const { name, description, statusId, subtasks } = updateTaskDto;

    // 🔹 Load the task with its current subtasks
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['subtasks'],
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found.`);
    }

    // 🔹 If statusId is provided, check if that status exists and update the task's status
    if (statusId) {
      const statusExists = await this.statusRepository.findOne({
        where: { id: statusId },
      });
      if (!statusExists) {
        throw new NotFoundException(`Status with ID ${statusId} not found.`);
      }
      task.status = statusExists;
    }

    // 🔹 Update basic task fields if provided
    if (name !== undefined) task.name = name;
    if (description !== undefined) task.description = description;

    if (subtasks) {
      // 🔹 Process subtasks:
      // For each subtask in the update DTO, update existing or create new.
      const updatedSubtasks = await Promise.all(
        subtasks.map(async (subtaskDto) => {
          if ('id' in subtaskDto && subtaskDto.id) {
            // Update existing subtask
            await this.subtaskRepository.update(subtaskDto.id, {
              name: subtaskDto.name,
              completed: subtaskDto.completed,
            });
            return await this.subtaskRepository.findOne({
              where: { id: subtaskDto.id },
            });
          } else {
            // Create new subtask and associate it with the task
            const newSubtask = this.subtaskRepository.create({
              name: subtaskDto.name,
              completed: subtaskDto.completed,
              task, // link the new subtask with the task
            });
            return await this.subtaskRepository.save(newSubtask);
          }
        }),
      );

      // 🔹 Identify and remove orphaned subtasks:
      // Build an array of subtask IDs from the update DTO (for those subtasks that have an id)
      const updatedSubtaskIds = subtasks
        .filter((dto) => 'id' in dto && dto.id)
        .map((dto) => {
          if ('id' in dto) {
            return dto.id;
          }
          return null;
        })
        .filter((id): id is string => id !== null);

      // Any subtask in the task that is not in updatedSubtaskIds should be removed.
      const subtasksToRemove = task.subtasks.filter(
        (existingSubtask) => !updatedSubtaskIds.includes(existingSubtask.id),
      );

      if (subtasksToRemove.length > 0) {
        await this.subtaskRepository.remove(subtasksToRemove);
      }

      // 🔹 Update the task's subtasks with the newly updated/created subtasks.
      task.subtasks = updatedSubtasks.filter(
        (subtask): subtask is Subtask => subtask !== null,
      );
    }

    // 🔹 Save the updated task.
    const savedTask = await this.taskRepository.save(task);

    // 🔹 Transform the saved task into the response DTO.
    return plainToInstance(TaskResponseDto, savedTask);
  }

  async remove(id: string) {
    return await this.taskRepository.delete(id);
  }

  async sortTasks(taskIds: string[]): Promise<TaskResponseDto[]> {
    //return new Promise(() => [] as TaskResponseDto[]);
    const tasks = await this.taskRepository.find({
      where: { id: In(taskIds) },
    });

    if (tasks.length !== taskIds.length) {
      throw new BadRequestException('Some tasks were not found');
    }

    // Update the orderIndex based on the order in taskIds array
    for (let i = 0; i < taskIds.length; i++) {
      const task = tasks.find((t) => t.id === taskIds[i]);
      if (task) {
        task.orderIndex = i + 1; // 1-based index (or just use `i` for 0-based)
      }
    }

    await this.taskRepository.save(tasks);

    const sortedTasks = tasks.sort((a, b) => a.orderIndex - b.orderIndex);
    return plainToInstance(TaskResponseDto, sortedTasks);
  }
}
