import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const instance = winston.createLogger({
  transports: [
    new winston.transports.Console(),

    new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      zippedArchive: true,
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});

instance.on('error', (error) => {
  console.error('Winston transport error:', error);
});

export const loggerConfig = WinstonModule.createLogger({
  instance,
});
