import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Ensure this import is correct
import { Board } from './entities/board.entity';
import { Status } from './entities/status.entity';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { BoardMember } from '../board-member/entities/board-member.entity';
import { BoardMemberModule } from '../board-member/board-member.module';
import { BoardOwnerOnlyGuard } from './guards/board-owner-only.guard';
import { BoardMemberGuard } from '../guards/board-member.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Board, Status, BoardMember]), BoardMemberModule], // Include both entities
  exports: [TypeOrmModule],
  controllers: [BoardsController],
  providers: [BoardsService, BoardOwnerOnlyGuard, BoardMemberGuard],
})
export class BoardsModule {}
