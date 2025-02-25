import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { SunModule } from './sun/sun.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LightsModule } from './lights/lights.module';
import * as fs from 'fs';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'homeassistant.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    SunModule,
    LightsModule,
    ConfigModule.forRoot({
      ignoreEnvFile: !fs.existsSync('.env'),
    }),
  ],
  providers: [AppService],
})
export class AppModule {}
