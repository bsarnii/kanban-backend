import { Module } from '@nestjs/common';
import { BoardsModule } from './task-management/boards/boards.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './task-management/tasks/tasks.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { ThrottlerConfigModule } from './config/throttler-config/throttler-config.module';
import AppDataSource from './database/datasource';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env.production'],
    }),
    ThrottlerConfigModule,
    TypeOrmModule.forRoot(AppDataSource.options),
    AuthModule,
    BoardsModule,
    TasksModule,
    MailModule,
  ],
})
export class AppModule {}
