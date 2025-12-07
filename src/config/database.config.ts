import { config } from "dotenv";
import { DataSourceOptions } from "typeorm";

config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
});

export const typeormConfig: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DATABASE_HOST,
  port: +(process.env.DATABASE_PORT as string),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_DBNAME,
  entities: [
    __dirname + "/../**/entities/*.entity.{ts,js}",
    __dirname + "/../**/**/entities/*.entity.{ts,js}",
  ],
  migrations: [__dirname + '/../../db/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  migrationsRun: false,
  synchronize: process.env.NODE_ENV !== 'production',
};