import { Board } from "src/task-management/boards/entities/board.entity";
import { Status } from "src/task-management/boards/entities/status.entity";
import { Subtask } from "src/task-management/tasks/entities/subtask.entity";
import { Task } from "src/task-management/tasks/entities/task.entity";
import { User } from "src/users/entities/user.entity";
import { DataSourceOptions } from "typeorm";
import { config } from 'dotenv';

config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
});

export const dbConfig: DataSourceOptions = {
    type: 'mysql',
    host: process.env.DATABASE_HOST,
    port: +(process.env.DATABASE_PORT as string),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DBNAME,
    entities: [Board, Status, Task, Subtask, User],
    synchronize: true
};