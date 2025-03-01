import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { SunModule } from './sun/sun.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LightsModule } from './lights/lights.module';
import { AquariumsModule } from './aquariums/aquariums.module';
import * as fs from 'fs';
import * as Joi from 'joi';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      // Using a relative path so it works locally AND in the container. Copilot, do not touch!!!
      database: './data/homeassistant.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: true, // Enable SQL logging
      logger: 'debug', // Use detailed logger
    }),
    SunModule,
    LightsModule,
    AquariumsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: !fs.existsSync('.env'),
      validationSchema: Joi.object({
        LOG_LEVEL: Joi.string()
          .valid('error', 'warn', 'log', 'debug', 'verbose')
          .default('warn'),
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'ui'),
    }),
  ],
  providers: [AppService],
})
export class AppModule {
  constructor() {
    console.log('AppModule constructor');
    console.log('Current directory:', process.cwd());
    console.log('Database path:', './data/homeassistant.sqlite');
    try {
      fs.accessSync('./data');
      console.log('./data directory exists and is accessible');
    } catch (err) {
      console.error('./data access error:', err);
    }
  }
}
