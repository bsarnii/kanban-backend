import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BoardsService } from './boards.service';
import { Board } from './entities/board.entity';
import { Status } from './entities/status.entity';
import { BoardMemberService } from '../board-member/board-member.service';

describe('BoardsService', () => {
  let service: BoardsService;

  let boardRepository: jest.Mocked<Repository<Board>>;
  let statusRepository: jest.Mocked<Repository<Status>>;
  let boardMemberService: jest.Mocked<BoardMemberService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        {
          provide: getRepositoryToken(Board),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Status),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: BoardMemberService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(BoardsService);

    boardRepository = module.get(getRepositoryToken(Board));
    statusRepository = module.get(getRepositoryToken(Status));
    boardMemberService = module.get(BoardMemberService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

});