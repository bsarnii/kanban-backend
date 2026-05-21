import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { BoardOwnerGuard } from './board-owner.guard';
import { BoardMemberService } from '../board-member.service';
import { BoardMember } from '../entities/board-member.entity';

describe('BoardOwnerGuard', () => {
  let guard: BoardOwnerGuard;
  let boardMemberService: jest.Mocked<BoardMemberService>;

  const mockBoardMemberService: Partial<jest.Mocked<BoardMemberService>> = {
    getBoardMemberByBoardIdAndUserId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardOwnerGuard,
        {
          provide: BoardMemberService,
          useValue: mockBoardMemberService,
        },
      ],
    }).compile();

    guard = module.get<BoardOwnerGuard>(BoardOwnerGuard);
    boardMemberService = module.get(BoardMemberService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  function createMockExecutionContext(
    userId: string,
    boardId: string,
  ): ExecutionContext {
    const mockRequest = {
      user: { userId, email: 'test@example.com', iat: 0, exp: 9999999999 },
      params: { boardId },
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
  }

  describe('canActivate', () => {
    const userId = 'user-uuid-1';
    const boardId = 'board-uuid-1';

    it('should return true when the board member has role "owner"', async () => {
      const ownerMember = { id: 'member-1', userId, role: 'owner' } as BoardMember;
      mockBoardMemberService.getBoardMemberByBoardIdAndUserId = jest
        .fn()
        .mockResolvedValue(ownerMember);

      const context = createMockExecutionContext(userId, boardId);
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(boardMemberService.getBoardMemberByBoardIdAndUserId).toHaveBeenCalledWith(
        boardId,
        userId,
      );
    });

    it('should return false when the board member has role "editor"', async () => {
      const editorMember = { id: 'member-2', userId, role: 'editor' } as BoardMember;
      mockBoardMemberService.getBoardMemberByBoardIdAndUserId = jest
        .fn()
        .mockResolvedValue(editorMember);

      const context = createMockExecutionContext(userId, boardId);
      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return false when the board member has role "viewer"', async () => {
      const viewerMember = { id: 'member-3', userId, role: 'viewer' } as BoardMember;
      mockBoardMemberService.getBoardMemberByBoardIdAndUserId = jest
        .fn()
        .mockResolvedValue(viewerMember);

      const context = createMockExecutionContext(userId, boardId);
      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return false when the board member is not found (null)', async () => {
      mockBoardMemberService.getBoardMemberByBoardIdAndUserId = jest
        .fn()
        .mockResolvedValue(null);

      const context = createMockExecutionContext(userId, boardId);
      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should extract boardId from request.params.boardId', async () => {
      const specificBoardId = 'specific-board-id-abc';
      mockBoardMemberService.getBoardMemberByBoardIdAndUserId = jest
        .fn()
        .mockResolvedValue(null);

      const context = createMockExecutionContext(userId, specificBoardId);
      await guard.canActivate(context);

      expect(boardMemberService.getBoardMemberByBoardIdAndUserId).toHaveBeenCalledWith(
        specificBoardId,
        expect.any(String),
      );
    });

    it('should extract userId from request.user.userId', async () => {
      const specificUserId = 'specific-user-id-xyz';
      mockBoardMemberService.getBoardMemberByBoardIdAndUserId = jest
        .fn()
        .mockResolvedValue(null);

      const context = createMockExecutionContext(specificUserId, boardId);
      await guard.canActivate(context);

      expect(boardMemberService.getBoardMemberByBoardIdAndUserId).toHaveBeenCalledWith(
        expect.any(String),
        specificUserId,
      );
    });

    it('should call boardMemberService with correct boardId and userId', async () => {
      const specificBoardId = 'board-999';
      const specificUserId = 'user-888';
      mockBoardMemberService.getBoardMemberByBoardIdAndUserId = jest
        .fn()
        .mockResolvedValue(null);

      const context = createMockExecutionContext(specificUserId, specificBoardId);
      await guard.canActivate(context);

      expect(boardMemberService.getBoardMemberByBoardIdAndUserId).toHaveBeenCalledWith(
        specificBoardId,
        specificUserId,
      );
    });

    it('should propagate errors thrown by boardMemberService', async () => {
      const serviceError = new Error('Database connection error');
      mockBoardMemberService.getBoardMemberByBoardIdAndUserId = jest
        .fn()
        .mockRejectedValue(serviceError);

      const context = createMockExecutionContext(userId, boardId);

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Database connection error',
      );
    });
  });
});