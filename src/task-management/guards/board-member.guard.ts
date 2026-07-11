import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthTokenPayload } from 'src/auth/types/jwt-auth-token-payload.type';
import { BoardMemberService } from 'src/task-management/board-member/board-member.service';

@Injectable()
export class BoardMemberGuard implements CanActivate {
  constructor(private readonly boardMemberService: BoardMemberService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest<Request>();
    const user = request.user as JwtAuthTokenPayload;
    const boardId = request.params.boardId ?? request.params.id;

    if (!user?.userId || typeof boardId !== 'string' || boardId.length === 0) {
      return false;
    }

    const boardMember =
      await this.boardMemberService.getBoardMemberByBoardIdAndUserId(
        boardId,
        user.userId,
      );

    return !!boardMember;
  }
}
