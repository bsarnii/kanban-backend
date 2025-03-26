import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BoardsModule } from './task-management/boards/boards.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './task-management/boards/entities/board.entity';
import { Status } from './task-management/boards/entities/status.entity';
import { TasksModule } from './task-management/tasks/tasks.module';
import { Task } from './task-management/tasks/entities/task.entity';
import { Subtask } from './task-management/tasks/entities/subtask.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: +(process.env.DATABASE_PORT as string),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DBNAME,
      entities: [Board, Status, Task, Subtask],
      synchronize: true,
    }),
    BoardsModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
