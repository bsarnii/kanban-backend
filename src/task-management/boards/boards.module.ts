import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Ensure this import is correct
import { Board } from './entities/board.entity';
import { Status } from './entities/status.entity';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { BoardMemberService } from '../board-member/board-member.service';
import { BoardMember } from '../board-member/entities/board-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board, Status, BoardMember])], // Include both entities
  exports: [TypeOrmModule],
  controllers: [BoardsController],
  providers: [BoardsService, BoardMemberService],
})
export class BoardsModule {}
