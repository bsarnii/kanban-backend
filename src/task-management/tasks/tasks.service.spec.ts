import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { Subtask } from './entities/subtask.entity';
import { Status } from '../boards/entities/status.entity';
import { Board } from '../boards/entities/board.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('TasksService', () => {
  let service: TasksService;
  let _boardRepo: Repository<Board>;
  let _taskRepo: Repository<Task>;
  let _subtaskRepo: Repository<Subtask>;
  let _statusRepo: Repository<Status>;

  const mockBoardRepo = () => ({
    findOne: jest.fn(),
    findOneBy: jest.fn(),
  });
  const mockTaskRepo = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  });

  const mockSubtaskRepo = () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  });

  const mockStatusRepo = () => ({
    findOne: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Board), useFactory: mockBoardRepo },
        { provide: getRepositoryToken(Task), useFactory: mockTaskRepo },
        { provide: getRepositoryToken(Subtask), useFactory: mockSubtaskRepo },
        { provide: getRepositoryToken(Status), useFactory: mockStatusRepo },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    _boardRepo = module.get<Repository<Board>>(getRepositoryToken(Board));
    _taskRepo = module.get<Repository<Task>>(getRepositoryToken(Task));
    _subtaskRepo = module.get<Repository<Subtask>>(getRepositoryToken(Subtask));
    _statusRepo = module.get<Repository<Status>>(getRepositoryToken(Status));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
