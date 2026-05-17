import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { JwtAuthTokenPayload } from 'src/auth/types/jwt-auth-token-payload.type';
import { BoardMemberService } from '../board-member.service';

@Injectable()
export class BoardOwnerGuard implements CanActivate {
  constructor(private readonly boardMemberService: BoardMemberService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest<Request>();
    const user = request.user as JwtAuthTokenPayload;
    const boardId = request.params.boardId;
    return this.boardMemberService.getBoardMemberByBoardIdAndUserId(boardId, user.userId).then(boardMember => {
      if (!boardMember) {
        return false;
      }
      return boardMember.role === 'owner';
    });
  }
}