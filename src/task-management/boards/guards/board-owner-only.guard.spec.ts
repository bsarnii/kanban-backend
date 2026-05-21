import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, NotFoundException } from '@nestjs/common';
import { BoardOwnerOnlyGuard } from './board-owner-only.guard';
import { BoardsService } from '../boards.service';
import { BoardWithMemberRoleResponseDto } from '../dto/board-with-member-role-response.dto';

describe('BoardOwnerOnlyGuard', () => {
  let guard: BoardOwnerOnlyGuard;
  let boardsService: jest.Mocked<BoardsService>;

  const mockBoardsService: Partial<jest.Mocked<BoardsService>> = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardOwnerOnlyGuard,
        {
          provide: BoardsService,
          useValue: mockBoardsService,
        },
      ],
    }).compile();

    guard = module.get<BoardOwnerOnlyGuard>(BoardOwnerOnlyGuard);
    boardsService = module.get(BoardsService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  function createMockExecutionContext(userId: string, id: string): ExecutionContext {
    const mockRequest = {
      user: { userId, email: 'test@example.com', iat: 0, exp: 9999999999 },
      params: { id },
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
  }

  function createMockBoard(
    boardMemberRole: 'owner' | 'editor' | 'viewer' | null,
  ): BoardWithMemberRoleResponseDto {
    return {
      id: 'board-uuid-1',
      name: 'Test Board',
      createdBy: 'user-uuid-1',
      createdAt: new Date(),
      boardMemberRole,
    } as unknown as BoardWithMemberRoleResponseDto;
  }

  describe('canActivate', () => {
    const userId = 'user-uuid-1';
    const boardId = 'board-uuid-1';

    it('should return true when board.boardMemberRole is "owner"', async () => {
      const ownerBoard = createMockBoard('owner');
      mockBoardsService.findOne = jest.fn().mockResolvedValue(ownerBoard);

      const context = createMockExecutionContext(userId, boardId);
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(boardsService.findOne).toHaveBeenCalledWith(boardId, userId);
    });

    it('should return false when board.boardMemberRole is "editor"', async () => {
      const editorBoard = createMockBoard('editor');
      mockBoardsService.findOne = jest.fn().mockResolvedValue(editorBoard);

      const context = createMockExecutionContext(userId, boardId);
      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return false when board.boardMemberRole is "viewer"', async () => {
      const viewerBoard = createMockBoard('viewer');
      mockBoardsService.findOne = jest.fn().mockResolvedValue(viewerBoard);

      const context = createMockExecutionContext(userId, boardId);
      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return false when board.boardMemberRole is null', async () => {
      const boardWithNoRole = createMockBoard(null);
      mockBoardsService.findOne = jest.fn().mockResolvedValue(boardWithNoRole);

      const context = createMockExecutionContext(userId, boardId);
      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should extract boardId from request.params.id (not boardId)', async () => {
      const specificBoardId = 'specific-id-param';
      mockBoardsService.findOne = jest.fn().mockResolvedValue(createMockBoard('owner'));

      const context = createMockExecutionContext(userId, specificBoardId);
      await guard.canActivate(context);

      expect(boardsService.findOne).toHaveBeenCalledWith(specificBoardId, expect.any(String));
    });

    it('should extract userId from request.user.userId', async () => {
      const specificUserId = 'specific-user-id';
      mockBoardsService.findOne = jest.fn().mockResolvedValue(createMockBoard('owner'));

      const context = createMockExecutionContext(specificUserId, boardId);
      await guard.canActivate(context);

      expect(boardsService.findOne).toHaveBeenCalledWith(expect.any(String), specificUserId);
    });

    it('should call boardsService.findOne with correct id and userId', async () => {
      const specificBoardId = 'board-777';
      const specificUserId = 'user-888';
      mockBoardsService.findOne = jest.fn().mockResolvedValue(createMockBoard('owner'));

      const context = createMockExecutionContext(specificUserId, specificBoardId);
      await guard.canActivate(context);

      expect(boardsService.findOne).toHaveBeenCalledWith(specificBoardId, specificUserId);
    });

    it('should propagate NotFoundException thrown by boardsService.findOne', async () => {
      mockBoardsService.findOne = jest
        .fn()
        .mockRejectedValue(new NotFoundException('Board with ID board-uuid-1 not found'));

      const context = createMockExecutionContext(userId, boardId);

      await expect(guard.canActivate(context)).rejects.toThrow(NotFoundException);
    });

    it('should propagate generic errors thrown by boardsService.findOne', async () => {
      const dbError = new Error('Database error');
      mockBoardsService.findOne = jest.fn().mockRejectedValue(dbError);

      const context = createMockExecutionContext(userId, boardId);

      await expect(guard.canActivate(context)).rejects.toThrow('Database error');
    });
  });
});
