import { Module } from '@nestjs/common';
import { BoardMemberService } from './board-member.service';
import { BoardMemberController } from './board-member.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardMember } from './entities/board-member.entity';
import { Board } from '../boards/entities/board.entity';
import { User } from '../../users/entities/user.entity';
import { BoardOwnerGuard } from './guards/board-owner.guard';
import { BoardMemberGuard } from '../guards/board-member.guard';

@Module({
  imports: [TypeOrmModule.forFeature([BoardMember, Board, User])],
  controllers: [BoardMemberController],
  providers: [BoardMemberService, BoardOwnerGuard, BoardMemberGuard],
  exports: [BoardMemberService],
})
export class BoardMemberModule {}
