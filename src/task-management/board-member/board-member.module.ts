import { Module } from '@nestjs/common';
import { BoardMemberService } from './board-member.service';
import { BoardMemberController } from './board-member.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardMember } from './entities/board-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BoardMember])],
  controllers: [BoardMemberController],
  providers: [BoardMemberService],
  exports: [BoardMemberService]
})
export class BoardMemberModule {}
