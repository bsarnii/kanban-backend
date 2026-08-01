import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

import { BoardsService } from './boards.service';
import { Board } from './entities/board.entity';
import { Status } from './entities/status.entity';
import { BoardMemberService } from '../board-member/board-member.service';
import { BoardMember } from '../board-member/entities/board-member.entity';

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

  describe('create', () => {
    it('should create a board and assign the user as owner', async () => {
      const userId = 'user-1';

      const createBoardDto = {
        name: 'My Board',
        statuses: [],
      };

      const board: Board = {
        id: 'board-1',
        name: 'My Board',
        statuses: [],
        createdBy: userId,
        boardMembers: [
          {
            userId,
            role: 'owner',
          } as BoardMember,
        ],
        createdAt: new Date(),
        tasks: [],
      };

      const boardRepoCreateSpy = jest.spyOn(boardRepository, 'create');
      const boardRepoSaveSpy = jest.spyOn(boardRepository, 'save');
      const boardMemberServiceCreateSpy = jest.spyOn(
        boardMemberService,
        'create',
      );

      boardRepoCreateSpy.mockReturnValue(board);
      boardRepoSaveSpy.mockResolvedValue(board);
      boardRepository.findOne.mockResolvedValue(board);
      boardMemberServiceCreateSpy.mockResolvedValue({} as BoardMember);

      const result = await service.create(createBoardDto, userId);

      expect(boardRepoCreateSpy).toHaveBeenCalledWith({
        name: 'My Board',
        statuses: [],
        createdBy: userId,
      });

      expect(boardRepoSaveSpy).toHaveBeenCalledWith(board);

      expect(boardMemberServiceCreateSpy).toHaveBeenCalledWith({
        userId,
        board,
        role: 'owner',
      });

      const { boardMembers: _boardMembers, ...boardWithoutMembers } = board;

      expect(result).toEqual({
        ...boardWithoutMembers,
        boardMemberRole: 'owner',
      });

      expect(result).not.toHaveProperty('boardMembers');
    });

    it('should throw NotFoundException when the created board cannot be found', async () => {
      const userId = 'user-1';

      const board = {
        id: 'board-1',
        name: 'My Board',
        statuses: [],
      } as unknown as Board;

      boardRepository.create.mockReturnValue(board);
      boardRepository.save.mockResolvedValue(board);
      boardRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create(
          {
            name: 'My Board',
            statuses: [],
          },
          userId,
        ),
      ).rejects.toThrow(
        new NotFoundException('Board with ID board-1 not found'),
      );
    });
  });
  describe('findOne', () => {
    it('should returns board', async () => {
      boardRepository.findOne.mockResolvedValue({
        id: '1',
        statuses: [],
        boardMembers: [
          {
            userId: 'user1',
            role: 'editor',
          },
        ],
      } as unknown as Board);

      const result = await service.findOne('1', 'user1');

      expect(result.boardMemberRole).toBe('editor');
    });
    it('should throw when board not found', async () => {
      boardRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
  describe('findAllWithBoardMemberRole', () => {
    it('should return boards with member roles', async () => {
      const boards = [
        {
          id: '1',
          statuses: [],
          boardMembers: [
            {
              userId: 'user1',
              role: 'owner',
            },
          ],
        },
      ];

      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(boards),
      } as unknown as ReturnType<typeof boardRepository.createQueryBuilder>;

      boardRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAllWithBoardMemberRole('user1');

      expect(result).toHaveLength(1);
      expect(result[0].boardMemberRole).toBe('owner');
    });
  });
  describe('update', () => {
    it('should throw NotFoundException if board does not exist', async () => {
      const findOneSpy = jest.spyOn(boardRepository, 'findOne');
      findOneSpy.mockResolvedValueOnce(null);

      await expect(
        service.update('1', { name: 'New', statuses: [] }, 'user1'),
      ).rejects.toThrow(NotFoundException);

      expect(findOneSpy).toHaveBeenCalledTimes(1);
    });
    it('should update board name', async () => {
      const board = {
        id: '1',
        name: 'Old Name',
        statuses: [],
        boardMembers: [],
      } as unknown as Board;

      boardRepository.findOne
        .mockResolvedValueOnce(board)
        .mockResolvedValueOnce(board);

      const saveSpy = jest.spyOn(boardRepository, 'save');
      saveSpy.mockResolvedValue(board);

      boardRepository.save.mockResolvedValue(board);

      await service.update(
        '1',
        {
          name: 'New Name',
          statuses: [],
        },
        'user1',
      );

      expect(board.name).toBe('New Name');

      expect(saveSpy).toHaveBeenCalledWith(board);
    });
    it('should update existing status', async () => {
      const status = {
        id: 'status1',
        name: 'Todo',
      };

      const board = {
        id: '1',
        statuses: [status],
        boardMembers: [],
      } as unknown as Board;

      boardRepository.findOne
        .mockResolvedValueOnce(board)
        .mockResolvedValueOnce(board);

      const statusSaveSpy = jest.spyOn(statusRepository, 'save');
      statusSaveSpy.mockImplementation((s) =>
        Promise.resolve({ id: 'status1', name: s.name } as Status),
      );

      boardRepository.save.mockResolvedValue(board);

      await service.update(
        '1',
        {
          statuses: [
            {
              id: 'status1',
              name: 'Backlog',
            },
          ],
        },
        'user1',
      );

      expect(status.name).toBe('Backlog');

      expect(statusSaveSpy).toHaveBeenCalledWith(status);
    });
    it('should create new status', async () => {
      const board = {
        id: '1',
        statuses: [],
        boardMembers: [],
      } as unknown as Board;

      const newStatus = {
        id: 'status2',
        name: 'Done',
      } as unknown as Status;

      boardRepository.findOne
        .mockResolvedValueOnce(board)
        .mockResolvedValueOnce({
          ...board,
          statuses: [newStatus],
        });

      const statusCreateSpy = jest.spyOn(statusRepository, 'create');
      const statusSaveSpy = jest.spyOn(statusRepository, 'save');
      statusCreateSpy.mockReturnValue(newStatus);
      statusSaveSpy.mockResolvedValue(newStatus);

      boardRepository.save.mockResolvedValue(board);

      await service.update(
        '1',
        {
          statuses: [
            {
              name: 'Done',
            },
          ],
        },
        'user1',
      );

      expect(statusCreateSpy).toHaveBeenCalledWith({
        name: 'Done',
        board,
      });

      expect(statusSaveSpy).toHaveBeenCalledWith(newStatus);
    });
    it('should remove deleted statuses', async () => {
      const todo = { id: '1', name: 'Todo' };
      const doing = { id: '2', name: 'Doing' };
      const done = { id: '3', name: 'Done' };

      const board = {
        id: 'board1',
        statuses: [todo, doing, done],
        boardMembers: [],
      } as unknown as Board;

      boardRepository.findOne
        .mockResolvedValueOnce(board)
        .mockResolvedValueOnce(board);

      statusRepository.save.mockImplementation(async (s) =>
        Promise.resolve({ id: 'status1', name: s.name } as Status),
      );

      boardRepository.save.mockResolvedValue(board);

      const removeSpy = jest.spyOn(statusRepository, 'remove');

      await service.update(
        'board1',
        {
          statuses: [
            { id: '1', name: 'Todo' },
            { id: '3', name: 'Done' },
          ],
        },
        'user1',
      );

      expect(removeSpy).toHaveBeenCalledWith([doing]);
    });
  });
});
