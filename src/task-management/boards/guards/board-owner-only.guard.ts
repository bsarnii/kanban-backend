import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { JwtAuthTokenPayload } from 'src/auth/types/jwt-auth-token-payload.type';
import { BoardsService } from '../boards.service';

@Injectable()
export class BoardOwnerOnlyGuard implements CanActivate {
  constructor(private readonly boardService: BoardsService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest<Request>();
    const user = request.user as JwtAuthTokenPayload;
    const boardId = request.params.id;
    return this.boardService.findOne(boardId, user.userId).then(board => {
      if (!board) {
        return false;
      }
      return board.boardMemberRole === 'owner';
    });
  }
}