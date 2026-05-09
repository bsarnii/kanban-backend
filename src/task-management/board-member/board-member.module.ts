import { Module } from '@nestjs/common';
import { BoardMemberService } from './board-member.service';
import { BoardMemberController } from './board-member.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardMember } from './entities/board-member.entity';
import { Board } from '../boards/entities/board.entity';
import { User } from '../../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BoardMember, Board, User])],
  controllers: [BoardMemberController],
  providers: [BoardMemberService],
  exports: [BoardMemberService]
})
export class BoardMemberModule {}
