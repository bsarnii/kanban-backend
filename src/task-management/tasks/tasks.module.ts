import { Module, forwardRef } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Subtask } from './entities/subtask.entity';
import { BoardsModule } from '../boards/boards.module';
import { BoardMemberModule } from '../board-member/board-member.module';
import { BoardOwnerOrEditorGuard } from './guards/board-owner-or-editor.guard';
import { BoardMemberGuard } from '../guards/board-member.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Subtask]),
    BoardMemberModule,
    forwardRef(() => BoardsModule),
  ],
  controllers: [TasksController],
  providers: [TasksService, BoardOwnerOrEditorGuard, BoardMemberGuard],
})
export class TasksModule {}
