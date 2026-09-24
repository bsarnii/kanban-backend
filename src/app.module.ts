import { Module, MiddlewareConsumer } from '@nestjs/common';
import { RequestLoggingMiddleware } from './common/middleware/request-logging.middleware';
import { BoardsModule } from './task-management/boards/boards.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './task-management/tasks/tasks.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { ThrottlerConfigModule } from './config/throttler-config/throttler-config.module';
import { BoardMemberModule } from './task-management/board-member/board-member.module';
import AppDataSource from './database/datasource';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env.production', '.env'],
    }),
    ThrottlerConfigModule,
    TypeOrmModule.forRoot(AppDataSource.options),
    AuthModule,
    BoardsModule,
    TasksModule,
    MailModule,
    BoardMemberModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware).forRoutes('*');
  }
}
