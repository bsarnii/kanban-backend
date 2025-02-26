import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BoardsModule } from './task-management/boards/boards.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './task-management/boards/entities/board.entity';
import { Status } from './task-management/boards/entities/status.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'kanban',
      entities: [Board, Status],
      synchronize: true,
    }),
    BoardsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
