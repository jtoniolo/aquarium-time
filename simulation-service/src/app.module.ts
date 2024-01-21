import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { SunModule } from './sun/sun.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import * as fs from 'fs';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SunModule,
    ConfigModule.forRoot({
      ignoreEnvFile: !fs.existsSync('.env'),
    }),
  ],

  providers: [AppService],
})
export class AppModule {}
