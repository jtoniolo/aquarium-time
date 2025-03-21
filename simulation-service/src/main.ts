process.on('uncaughtException', (error) => {
  console.error('FATAL: Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('FATAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import { ConsoleLogger, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  console.log('Starting bootstrap process...');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // This is where you're supposed to set the log level!
    logger: new ConsoleLogger('Sim Service', {
      // Copilot! Log settings go here shithead!!!!!
      logLevels: [(process.env.LOG_LEVEL as LogLevel) || 'warn'],
    }),
  });
  console.log('NestFactory.create completed');

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  console.log('CORS enabled');

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  console.log('Swagger setup completed');

  console.log('Starting to listen on port 3000...');
  try {
    await app.listen(3000);
    console.log('Application successfully started and listening');
    // Keep the process running
    process.on('SIGTERM', () => {
      console.log('Received SIGTERM signal');
      app.close();
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
