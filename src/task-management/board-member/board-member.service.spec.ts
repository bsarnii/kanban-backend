import { Test, TestingModule } from '@nestjs/testing';
import { BoardMemberService } from './board-member.service';
import { Repository } from 'typeorm';
import { BoardMember } from './entities/board-member.entity';
import { Board } from '../boards/entities/board.entity';
import { User } from '../../users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('BoardMemberService', () => {
  let service: BoardMemberService;
  let boardRepo: Repository<Board>;
  let boardMemberRepo: Repository<BoardMember>;
  let userRepo: Repository<User>;

  const mockBoardRepo = () => ({
    findOne: jest.fn(),
  });

  const mockBoardMemberRepo = () => ({
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  });

  const mockUserRepo = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardMemberService,
        { provide: getRepositoryToken(Board), useFactory: mockBoardRepo },
        { provide: getRepositoryToken(BoardMember), useFactory: mockBoardMemberRepo },
        { provide: getRepositoryToken(User), useFactory: mockUserRepo },
      ],
    }).compile();

    service = module.get<BoardMemberService>(BoardMemberService);
    boardRepo = module.get<Repository<Board>>(getRepositoryToken(Board));
    boardMemberRepo = module.get<Repository<BoardMember>>(getRepositoryToken(BoardMember));
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
