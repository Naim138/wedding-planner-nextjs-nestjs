import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import * as morgan from 'morgan';

config({ path: '.env' });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 5000;

  app.enableCors({
    origin: (origin, callback) => {
      // Allow all origins for local mobile/web client development
      callback(null, true);
    },
    credentials: true,
  });

  app.use(morgan('dev'));

  app.useGlobalPipes(
    new ValidationPipe()
  );

  await app.listen(port, '0.0.0.0');

  console.log(
    `🚀 Server running on http://0.0.0.0:${port}`
  );
}

bootstrap();